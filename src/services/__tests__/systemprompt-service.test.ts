import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { SystemPromptService } from "../systemprompt-service.js";
import type {
  CreatePromptInput,
  EditPromptInput,
  CreateBlockInput,
  EditBlockInput,
  PromptCreationResult,
} from "../../types/index.js";

describe("SystemPromptService", () => {
  let service: SystemPromptService;
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    // Reset the module state
    jest.resetModules();
    // Reset the service before each test
    service = SystemPromptService.getInstance();
    service.initialize(mockApiKey);
    // Mock fetch globally
    global.fetch = jest.fn(
      async (
        _input: RequestInfo | URL,
        _init?: RequestInit
      ): Promise<Response> =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve("{}"),
          json: () => Promise.resolve({}),
          headers: new Headers(),
          redirected: false,
          status: 200,
          statusText: "OK",
          type: "basic" as ResponseType,
          url: "",
          clone: () => new Response(),
          body: null,
          bodyUsed: false,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
          blob: () => Promise.resolve(new Blob()),
          formData: () => Promise.resolve(new FormData()),
        } as Response)
    ) as unknown as typeof global.fetch;
  });

  describe("initialization and configuration", () => {
    it("should initialize with API key", () => {
      const service = SystemPromptService.getInstance();
      expect(() => service.initialize(mockApiKey)).not.toThrow();
    });

    it("should throw error when not initialized", async () => {
      await jest.isolateModules(async () => {
        const { SystemPromptService } = await import(
          "../systemprompt-service.js"
        );
        const uninitializedService = SystemPromptService.getInstance();
        await expect(uninitializedService.getPrompt("test-id")).rejects.toThrow(
          "Service not initialized"
        );
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it("should initialize service with correct base URL", () => {
      const service = SystemPromptService.getInstance();
      expect((service as any).baseUrl).toBe("https://api.systemprompt.io/v1");
    });
  });

  describe("API requests", () => {
    describe("Error handling", () => {
      it("should handle API errors", async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
          Promise.resolve({
            ok: false,
            statusText: "Not Found",
            text: () => Promise.resolve("Resource not found"),
            headers: new Headers(),
            redirected: false,
            status: 404,
            type: "basic",
            url: "",
            clone: () => new Response(),
            body: null,
            bodyUsed: false,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            blob: () => Promise.resolve(new Blob()),
            formData: () => Promise.resolve(new FormData()),
          } as Response)
        );

        await expect(service["request"]("/test")).rejects.toThrow(
          "API request failed: Not Found"
        );
      });

      it("should handle JSON parsing errors", async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            text: () => Promise.resolve("invalid json"),
            headers: new Headers(),
            redirected: false,
            status: 200,
            statusText: "OK",
            type: "basic",
            url: "",
            clone: () => new Response(),
            body: null,
            bodyUsed: false,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            blob: () => Promise.resolve(new Blob()),
            formData: () => Promise.resolve(new FormData()),
          } as Response)
        );

        await expect(service["request"]("/test")).rejects.toThrow(
          "Invalid JSON"
        );
      });
    });

    describe("Prompt operations", () => {
      const mockPrompt: PromptCreationResult = {
        id: "test-id",
        metadata: {
          title: "Test Prompt",
          description: "Test description",
          created: "2024-01-01",
          updated: "2024-01-01",
          version: 1,
          status: "draft",
          author: "test",
          log_message: "Initial creation",
        },
        instruction: {
          static: "Test instruction",
        },
        input: {
          name: "test_input",
          description: "Test input",
          type: ["message"],
          schema: {
            type: "object",
            properties: {},
          },
        },
        output: {
          name: "test_output",
          description: "Test output",
          type: ["message"],
          schema: {
            type: "object",
            properties: {},
          },
        },
        _link: "test-link",
      };

      beforeEach(() => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve({
            ok: true,
            text: () => Promise.resolve(JSON.stringify(mockPrompt)),
            headers: new Headers(),
            redirected: false,
            status: 200,
            statusText: "OK",
            type: "basic",
            url: "",
            clone: () => new Response(),
            body: null,
            bodyUsed: false,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            blob: () => Promise.resolve(new Blob()),
            formData: () => Promise.resolve(new FormData()),
          } as Response)
        );
      });

      it("should get all prompts", async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            text: () => Promise.resolve(JSON.stringify([mockPrompt])),
            headers: new Headers(),
            redirected: false,
            status: 200,
            statusText: "OK",
            type: "basic",
            url: "",
            clone: () => new Response(),
            body: null,
            bodyUsed: false,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            blob: () => Promise.resolve(new Blob()),
            formData: () => Promise.resolve(new FormData()),
          } as Response)
        );

        const result = await service.getAllPrompt();
        expect(result).toEqual([mockPrompt]);
      });

      it("should get a single prompt", async () => {
        const result = await service.getPrompt("test-id");
        expect(result).toEqual(mockPrompt);
      });

      it("should create a prompt", async () => {
        const input: CreatePromptInput = {
          metadata: {
            title: "Test Prompt",
            description: "Test description",
          },
          instruction: {
            static: "Test instruction",
          },
          input: {
            name: "test_input",
            description: "Test input",
            type: ["message"],
            schema: {
              type: "object",
              properties: {},
            },
          },
          output: {
            name: "test_output",
            description: "Test output",
            type: ["message"],
            schema: {
              type: "object",
              properties: {},
            },
          },
        };

        const result = await service.createPrompt(input);
        expect(result).toEqual(mockPrompt);
      });

      it("should update a prompt", async () => {
        const input: EditPromptInput = {
          uuid: "test-id",
          metadata: {
            title: "Updated Prompt",
            description: "Updated description",
          },
        };

        const result = await service.updatePrompt("test-id", input);
        expect(result).toEqual(mockPrompt);
      });

      it("should edit a prompt", async () => {
        const input: EditPromptInput = {
          uuid: "test-id",
          metadata: {
            title: "Edited Prompt",
            description: "Edited description",
          },
        };

        const result = await service.editPrompt("test-id", input);
        expect(result).toEqual(mockPrompt);
      });

      it("should delete a prompt", async () => {
        await expect(service.deletePrompt("test-id")).resolves.not.toThrow();
      });
    });

    describe("Block operations", () => {
      const mockBlock = {
        id: "test-block-id",
        content: "Test content",
        metadata: {
          title: "Test Block",
          description: "Test description",
          created: "2024-01-01",
          updated: "2024-01-01",
        },
      };

      beforeEach(() => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve({
            ok: true,
            text: () => Promise.resolve(JSON.stringify(mockBlock)),
            headers: new Headers(),
            redirected: false,
            status: 200,
            statusText: "OK",
            type: "basic",
            url: "",
            clone: () => new Response(),
            body: null,
            bodyUsed: false,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            blob: () => Promise.resolve(new Blob()),
            formData: () => Promise.resolve(new FormData()),
          } as Response)
        );
      });

      it("should list all blocks", async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            text: () => Promise.resolve(JSON.stringify([mockBlock])),
            headers: new Headers(),
            redirected: false,
            status: 200,
            statusText: "OK",
            type: "basic",
            url: "",
            clone: () => new Response(),
            body: null,
            bodyUsed: false,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            blob: () => Promise.resolve(new Blob()),
            formData: () => Promise.resolve(new FormData()),
          } as Response)
        );

        const result = await service.listblock();
        expect(result).toEqual([mockBlock]);
      });

      it("should get a single block", async () => {
        const result = await service.getBlock("test-block-id");
        expect(result).toEqual(mockBlock);
      });

      it("should create a block", async () => {
        const input: CreateBlockInput = {
          metadata: {
            title: "Test Block",
            description: "Test description",
          },
          content: "Test content",
        };

        const result = await service.createBlock(input);
        expect(result).toEqual(mockBlock);
      });

      it("should update a block", async () => {
        const input: EditBlockInput = {
          metadata: {
            title: "Updated Block",
            description: "Updated description",
          },
          content: "Updated content",
        };

        const result = await service.updateBlock("test-block-id", input);
        expect(result).toEqual(mockBlock);
      });

      it("should delete a block", async () => {
        await expect(
          service.deleteBlock("test-block-id")
        ).resolves.not.toThrow();
      });
    });
  });
});
