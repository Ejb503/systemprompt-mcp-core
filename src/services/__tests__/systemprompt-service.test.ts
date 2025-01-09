import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import {
  SystemPromptService,
  initializeService,
  getApiKey,
} from "../systemprompt-service.js";
import type {
  CreatePromptInput,
  EditPromptInput,
  PromptCreationResult,
} from "../../types/index.js";

describe("SystemPromptService", () => {
  let service: SystemPromptService;
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    // Reset the module state
    jest.resetModules();
    // Reset the service before each test
    service = new SystemPromptService();
    service.initialize(mockApiKey);
    // Mock fetch globally
    global.fetch = jest.fn() as jest.Mocked<typeof fetch>;
  });

  describe("initialization and configuration", () => {
    it("should initialize with API key", () => {
      expect(() => service.initialize(mockApiKey)).not.toThrow();
    });

    it("should throw error when not initialized", async () => {
      await jest.isolateModules(async () => {
        const { SystemPromptService } = await import(
          "../systemprompt-service.js"
        );
        const uninitializedService = new SystemPromptService();
        await expect(uninitializedService.getPrompt("test-id")).rejects.toThrow(
          "Service not initialized"
        );
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it("should initialize service with correct base URL", () => {
      const newService = new SystemPromptService();
      expect((newService as any).baseUrl).toBe(
        "https://api.systemprompt.io/v1"
      );
    });

    it("should get API key after initialization", () => {
      initializeService(mockApiKey);
      expect(getApiKey()).toBe(mockApiKey);
    });

    it("should throw error when getting API key before initialization", () => {
      jest.isolateModules(() => {
        const { getApiKey } = require("../systemprompt-service.js");
        expect(() => getApiKey()).toThrow("Service not initialized");
      });
    });
  });

  describe("API requests", () => {
    const mockSuccessResponse = (data: any) =>
      ({
        ok: true,
        json: () => Promise.resolve(data),
      } as Response);

    const mockErrorResponse = (statusText: string) =>
      ({
        ok: false,
        statusText,
      } as Response);

    describe("Error handling", () => {
      it("should handle API errors", async () => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockErrorResponse("Not Found"))
        );

        await expect(service["request"]("/test")).rejects.toThrow(
          "API request failed: Not Found"
        );
      });

      it("should handle network errors", async () => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.reject(new Error("Network error"))
        );

        await expect(service["request"]("/test")).rejects.toThrow(
          "Network error"
        );
      });

      it("should handle JSON parsing errors", async () => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.reject(new Error("Invalid JSON")),
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
          description: "Test Description",
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
          description: "Test input description",
          type: ["message"],
          schema: { type: "object", properties: {} },
        },
        output: {
          name: "test_output",
          description: "Test output description",
          type: ["message"],
          schema: { type: "object", properties: {} },
        },
        _link: "test-link",
      };

      it("should get all prompts", async () => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockSuccessResponse([mockPrompt]))
        );

        const result = await service.getAllPrompt();
        expect(result).toEqual([mockPrompt]);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.systemprompt.io/v1/prompt",
          expect.objectContaining({ method: "GET" })
        );
      });

      it("should get a single prompt", async () => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockSuccessResponse(mockPrompt))
        );

        const result = await service.getPrompt("test-id");
        expect(result).toEqual(mockPrompt);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.systemprompt.io/v1/prompt/test-id",
          expect.objectContaining({ method: "GET" })
        );
      });

      it("should create a prompt", async () => {
        const createInput: CreatePromptInput = {
          metadata: {
            title: mockPrompt.metadata.title,
            description: mockPrompt.metadata.description,
          },
          instruction: mockPrompt.instruction,
          input: mockPrompt.input,
          output: mockPrompt.output,
        };

        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockSuccessResponse(mockPrompt))
        );

        const result = await service.createPrompt(createInput);
        expect(result).toEqual(mockPrompt);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.systemprompt.io/v1/prompt",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify(createInput),
          })
        );
      });

      it("should update a prompt", async () => {
        const updateInput: EditPromptInput = {
          uuid: "test-id",
          metadata: {
            title: "Updated Title",
            description: "Updated Description",
          },
        };

        const updatedPrompt = {
          ...mockPrompt,
          metadata: {
            ...mockPrompt.metadata,
            title: "Updated Title",
            description: "Updated Description",
          },
        };

        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockSuccessResponse(updatedPrompt))
        );

        const result = await service.updatePrompt("test-id", updateInput);
        expect(result).toEqual(updatedPrompt);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.systemprompt.io/v1/prompt/test-id",
          expect.objectContaining({
            method: "PUT",
            body: JSON.stringify(updateInput),
          })
        );
      });

      it("should edit a prompt", async () => {
        const editInput: EditPromptInput = {
          uuid: "test-id",
          metadata: {
            title: "Updated Title",
            description: "Updated Description",
          },
        };

        const updatedPrompt = {
          ...mockPrompt,
          metadata: {
            ...mockPrompt.metadata,
            title: "Updated Title",
            description: "Updated Description",
          },
        };

        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockSuccessResponse(updatedPrompt))
        );

        const result = await service.editPrompt("test-id", editInput);
        expect(result).toEqual(updatedPrompt);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.systemprompt.io/v1/prompt/test-id",
          expect.objectContaining({
            method: "PUT",
            body: JSON.stringify(editInput),
          })
        );
      });

      it("should delete a prompt", async () => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockSuccessResponse(undefined))
        );

        await service.deletePrompt("test-id");
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.systemprompt.io/v1/prompt/test-id",
          expect.objectContaining({ method: "DELETE" })
        );
      });
    });

    describe("Block operations", () => {
      const mockBlock = {
        id: "test-block-id",
        content: "Test block content",
        metadata: {
          title: "Test Block",
          description: "Test Block Description",
        },
      };

      it("should list all blocks", async () => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockSuccessResponse([mockBlock]))
        );

        const result = await service.listblock();
        expect(result).toEqual([mockBlock]);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.systemprompt.io/v1/block",
          expect.objectContaining({ method: "GET" })
        );
      });

      it("should get a single block", async () => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockSuccessResponse(mockBlock))
        );

        const result = await service.getBlock("test-block-id");
        expect(result).toEqual(mockBlock);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.systemprompt.io/v1/block/test-block-id",
          expect.objectContaining({ method: "GET" })
        );
      });

      it("should create a block", async () => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockSuccessResponse(mockBlock))
        );

        const result = await service.createBlock(mockBlock);
        expect(result).toEqual(mockBlock);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.systemprompt.io/v1/block",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify(mockBlock),
          })
        );
      });

      it("should update a block", async () => {
        const updatedBlock = {
          ...mockBlock,
          content: "Updated content",
        };

        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockSuccessResponse(updatedBlock))
        );

        const result = await service.updateBlock("test-block-id", updatedBlock);
        expect(result).toEqual(updatedBlock);
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.systemprompt.io/v1/block/test-block-id",
          expect.objectContaining({
            method: "PUT",
            body: JSON.stringify(updatedBlock),
          })
        );
      });

      it("should delete a block", async () => {
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockSuccessResponse(undefined))
        );

        await service.deleteBlock("test-block-id");
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.systemprompt.io/v1/block/test-block-id",
          expect.objectContaining({ method: "DELETE" })
        );
      });
    });
  });
});
