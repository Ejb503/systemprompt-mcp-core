import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import type { SpyInstance } from "jest-mock";
import { SystemPromptService } from "../systemprompt-service";
import type {
  SystempromptPromptResponse,
  SystempromptBlockResponse,
  SystempromptAgentResponse,
  SystempromptUserStatusResponse,
  SystempromptPromptRequest,
  SystempromptBlockRequest,
  SystempromptAgentRequest,
  Metadata,
} from "../../types/index.js";

describe("SystemPromptService", () => {
  const mockApiKey = "test-api-key";
  const mockBaseUrl = "http://test-api.com";
  let fetchSpy: SpyInstance<typeof fetch>;

  beforeEach(() => {
    // Reset the singleton instance
    SystemPromptService.cleanup();
    // Reset fetch mock
    fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(
        async (input: string | URL | Request, init?: RequestInit) => {
          const url =
            input instanceof URL ? input.toString() : input.toString();

          // Handle error cases
          if (url.includes("invalid-api-key")) {
            return new Response(
              JSON.stringify({ message: "Invalid API key" }),
              {
                status: 403,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          if (url.includes("not-found")) {
            return new Response(
              JSON.stringify({
                message: "Resource not found - it may have been deleted",
              }),
              { status: 404, headers: { "Content-Type": "application/json" } }
            );
          }

          if (url.includes("conflict")) {
            return new Response(
              JSON.stringify({
                message: "Resource conflict - it may have been edited",
              }),
              { status: 409, headers: { "Content-Type": "application/json" } }
            );
          }

          if (url.includes("bad-request")) {
            return new Response(JSON.stringify({ message: "Invalid data" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (url.includes("invalid-json")) {
            return new Response("invalid json", {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Handle successful cases
          if (init?.method === "DELETE") {
            return new Response(null, { status: 204 });
          }

          return new Response(JSON.stringify({ data: "test" }), {
            status: 200,
            statusText: "OK",
            headers: new Headers({
              "Content-Type": "application/json",
            }),
          });
        }
      );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe("initialization", () => {
    it("should initialize with API key", () => {
      SystemPromptService.initialize(mockApiKey);
      const instance = SystemPromptService.getInstance();
      expect(instance).toBeDefined();
    });

    it("should initialize with custom base URL", () => {
      SystemPromptService.initialize(mockApiKey, mockBaseUrl);
      const instance = SystemPromptService.getInstance();
      expect(instance).toBeDefined();
    });

    it("should throw error if initialized without API key", () => {
      expect(() => SystemPromptService.initialize("")).toThrow(
        "API key is required"
      );
    });

    it("should throw error if getInstance called before initialization", () => {
      expect(() => SystemPromptService.getInstance()).toThrow(
        "SystemPromptService must be initialized with an API key first"
      );
    });
  });

  describe("API requests", () => {
    let service: SystemPromptService;

    beforeEach(() => {
      SystemPromptService.initialize(mockApiKey, mockBaseUrl);
      service = SystemPromptService.getInstance();
    });

    it("should handle successful GET request", async () => {
      const mockResponse = { data: "test" };
      const result = await service.getAllPrompts();
      expect(result).toEqual(mockResponse);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${mockBaseUrl}/prompt`,
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "api-key": mockApiKey,
          },
        })
      );
    });

    it("should handle successful POST request", async () => {
      const data = {
        metadata: {
          title: "Test",
          description: "Test description",
          version: 1,
          status: "active",
          author: "test",
          log_message: "test",
        },
        instruction: {
          static: "Test instruction",
        },
        input: {
          type: ["text"],
        },
        output: {
          type: ["text"],
        },
      };
      const mockResponse = { data: "test" };
      const result = await service.createPrompt(data);
      expect(result).toEqual(mockResponse);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${mockBaseUrl}/prompt`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": mockApiKey,
          },
          body: JSON.stringify(data),
        })
      );
    });

    it("should handle 204 response", async () => {
      await service.deletePrompt("test-id");
      expect(fetchSpy).toHaveBeenCalledWith(
        `${mockBaseUrl}/prompt/test-id`,
        expect.objectContaining({
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "api-key": mockApiKey,
          },
        })
      );
    });

    it("should handle invalid API key error", async () => {
      fetchSpy.mockImplementationOnce(() =>
        Promise.resolve(
          new Response(JSON.stringify({ message: "Invalid API key" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          })
        )
      );
      await expect(service.getAllPrompts()).rejects.toThrow("Invalid API key");
    });

    it("should handle not found error", async () => {
      await expect(service.getBlock("not-found")).rejects.toThrow(
        "Resource not found - it may have been deleted"
      );
    });

    it("should handle conflict error", async () => {
      await expect(service.editPrompt("conflict", {})).rejects.toThrow(
        "Resource conflict - it may have been edited"
      );
    });

    it("should handle bad request error", async () => {
      fetchSpy.mockImplementationOnce(() =>
        Promise.resolve(
          new Response(JSON.stringify({ message: "Invalid data" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          })
        )
      );
      const invalidData: SystempromptPromptRequest = {
        metadata: {
          title: "Test",
          description: "Test description",
          version: 1,
          status: "active",
          author: "test",
          log_message: "test",
          tag: ["test"],
        },
        instruction: { static: "Test instruction" },
      };
      await expect(service.createPrompt(invalidData)).rejects.toThrow(
        "Invalid data"
      );
    });

    it("should handle network error", async () => {
      fetchSpy.mockImplementationOnce(() =>
        Promise.reject(new Error("Failed to fetch"))
      );
      await expect(service.getAllPrompts()).rejects.toThrow(
        "API request failed"
      );
    });

    it("should handle JSON parse error", async () => {
      fetchSpy.mockImplementationOnce(() =>
        Promise.resolve(
          new Response("invalid json", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      );
      await expect(service.getAllPrompts()).rejects.toThrow(
        "Failed to parse API response"
      );
    });
  });

  describe("API endpoints", () => {
    let service: SystemPromptService;

    beforeEach(() => {
      SystemPromptService.initialize(mockApiKey, mockBaseUrl);
      service = SystemPromptService.getInstance();
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("should call getAllPrompts endpoint", async () => {
      await service.getAllPrompts();
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/prompt"),
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
        })
      );
    });

    it("should call createPrompt endpoint", async () => {
      const data = {
        metadata: {
          title: "Test",
          description: "Test description",
          version: 1,
          status: "active",
          author: "test",
          log_message: "test",
        },
        instruction: {
          static: "Test instruction",
        },
        input: {
          type: ["text"],
        },
        output: {
          type: ["text"],
        },
      };
      await service.createPrompt(data);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/prompt"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
          body: JSON.stringify(data),
        })
      );
    });

    it("should call editPrompt endpoint", async () => {
      const data = {
        metadata: {
          title: "Test",
          description: "Test description",
          version: 1,
          status: "active",
          author: "test",
          log_message: "test",
        },
      };
      await service.editPrompt("test-id", data);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/prompt/test-id"),
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
          body: JSON.stringify(data),
        })
      );
    });

    it("should call deletePrompt endpoint", async () => {
      await service.deletePrompt("test-id");
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/prompt/test-id"),
        expect.objectContaining({
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
        })
      );
    });

    it("should call createBlock endpoint", async () => {
      const data = {
        content: "test",
        prefix: "test",
        metadata: {
          title: "Test",
          description: "Test description",
        },
      };
      await service.createBlock(data);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/block"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
          body: JSON.stringify(data),
        })
      );
    });

    it("should call editBlock endpoint", async () => {
      const data = {
        content: "test",
        metadata: {
          title: "Test",
        },
      };
      await service.editBlock("test-id", data);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/block/test-id"),
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
          body: JSON.stringify(data),
        })
      );
    });

    it("should call listBlocks endpoint", async () => {
      await service.listBlocks();
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/block"),
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
        })
      );
    });

    it("should call getBlock endpoint", async () => {
      await service.getBlock("test-id");
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/block/test-id"),
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
        })
      );
    });

    it("should call listAgents endpoint", async () => {
      await service.listAgents();
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/agent"),
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
        })
      );
    });

    it("should call createAgent endpoint", async () => {
      const data = {
        content: "test",
        metadata: {
          title: "Test",
          description: "Test description",
        },
      };
      await service.createAgent(data);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/agent"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
          body: JSON.stringify(data),
        })
      );
    });

    it("should call editAgent endpoint", async () => {
      const data = {
        content: "test",
        metadata: {
          title: "Test",
        },
      };
      await service.editAgent("test-id", data);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/agent/test-id"),
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
          body: JSON.stringify(data),
        })
      );
    });

    it("should call deleteBlock endpoint", async () => {
      await service.deleteBlock("test-id");
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/block/test-id"),
        expect.objectContaining({
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
        })
      );
    });

    it("should call fetchUserStatus endpoint", async () => {
      await service.fetchUserStatus();
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/user/mcp"),
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "api-key": "test-api-key",
          },
        })
      );
    });
  });
});
