import { jest } from "@jest/globals";
import { SystemPromptService } from "../../services/systemprompt-service.js";
import {
  handleListPrompts,
  handleGetPrompt,
  initializeService,
  convertToMCPPrompt,
} from "../prompt-handlers.js";
import type { PromptCreationResult } from "../../types/index.js";
import {
  mockSystemPromptResult,
  mockArrayPromptResult,
  mockNestedPromptResult,
  mockMCPPrompt,
  mockArrayMCPPrompt,
  mockNestedMCPPrompt,
} from "./mock-objects.js";

jest.mock("../../services/systemprompt-service.js");

describe("Prompt Handlers", () => {
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

  const mockService = {
    baseUrl: "https://api.systemprompt.io/v1",
    getAllPrompt: jest.fn<() => Promise<PromptCreationResult[]>>(),
    getPrompt: jest.fn<(id: string) => Promise<PromptCreationResult>>(),
    createPrompt: jest.fn<(data: any) => Promise<PromptCreationResult>>(),
    editPrompt:
      jest.fn<(id: string, data: any) => Promise<PromptCreationResult>>(),
    request: jest.fn(),
    initialize: jest.fn(),
    listblock: jest.fn(),
    getBlock: jest.fn(),
    createBlock: jest.fn(),
    updateBlock: jest.fn(),
    deleteBlock: jest.fn(),
    updatePrompt: jest.fn(),
    deletePrompt: jest.fn(),
  } as unknown as jest.Mocked<SystemPromptService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (
      SystemPromptService as jest.MockedClass<typeof SystemPromptService>
    ).mockImplementation(
      () => mockService as unknown as jest.Mocked<SystemPromptService>
    );
    initializeService("test-api-key");
  });

  describe("handleListPrompts", () => {
    it("should list prompts", async () => {
      mockService.getAllPrompt.mockResolvedValueOnce([mockPrompt]);

      const result = await handleListPrompts({
        method: "prompts/list",
        params: {},
      });

      expect(result).toEqual({
        prompts: [
          {
            name: mockPrompt.metadata.title,
            description: mockPrompt.metadata.description,
            messages: [
              {
                role: "assistant",
                content: {
                  type: "text",
                  text: mockPrompt.instruction.static,
                },
              },
            ],
            arguments: [],
          },
        ],
      });
      expect(mockService.getAllPrompt).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      mockService.getAllPrompt.mockRejectedValueOnce(
        new Error("API request failed")
      );

      await expect(
        handleListPrompts({
          method: "prompts/list",
          params: {},
        })
      ).rejects.toThrow("Failed to fetch prompts from systemprompt.io");
    });
  });

  describe("handleGetPrompt", () => {
    it("should get a prompt", async () => {
      mockService.getAllPrompt.mockResolvedValueOnce([mockPrompt]);

      const result = await handleGetPrompt({
        method: "prompts/get",
        params: {
          name: "Test Prompt",
        },
      });

      expect(result).toEqual({
        name: mockPrompt.metadata.title,
        description: mockPrompt.metadata.description,
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: mockPrompt.instruction.static,
            },
          },
        ],
        _meta: {},
        tools: [],
      });
      expect(mockService.getAllPrompt).toHaveBeenCalled();
    });

    it("should handle not found", async () => {
      mockService.getAllPrompt.mockResolvedValueOnce([mockPrompt]);

      await expect(
        handleGetPrompt({
          method: "prompts/get",
          params: {
            name: "Non-existent Prompt",
          },
        })
      ).rejects.toThrow("Prompt not found");
    });

    it("should handle errors", async () => {
      mockService.getAllPrompt.mockRejectedValueOnce(
        new Error("API request failed")
      );

      await expect(
        handleGetPrompt({
          method: "prompts/get",
          params: {
            name: "Test Prompt",
          },
        })
      ).rejects.toThrow("Failed to fetch prompt from systemprompt.io");
    });
  });

  describe("convertToMCPPrompt", () => {
    it("should convert basic prompt with simple schema", () => {
      const result = convertToMCPPrompt(mockSystemPromptResult);
      expect(result).toEqual(mockMCPPrompt);
    });

    it("should convert prompt with array schema", () => {
      const result = convertToMCPPrompt(mockArrayPromptResult);
      expect(result).toEqual(mockArrayMCPPrompt);
    });

    it("should convert prompt with nested object schema", () => {
      const result = convertToMCPPrompt(mockNestedPromptResult);
      expect(result).toEqual(mockNestedMCPPrompt);
    });

    it("should handle empty properties", () => {
      const promptWithEmptyProps = {
        ...mockSystemPromptResult,
        input: {
          ...mockSystemPromptResult.input,
          schema: {
            type: "object",
            properties: {},
          },
        },
      };
      const result = convertToMCPPrompt(promptWithEmptyProps);
      expect(result.arguments).toEqual([]);
    });

    it("should handle null or invalid schema properties", () => {
      const promptWithInvalidProps = {
        ...mockSystemPromptResult,
        input: {
          ...mockSystemPromptResult.input,
          schema: {
            type: "object",
            properties: {
              invalid1: null,
              invalid2: true,
              invalid3: "string",
            },
          },
        },
      };
      const result = convertToMCPPrompt(promptWithInvalidProps);
      expect(result.arguments).toEqual([]);
    });

    it("should handle schema property without description", () => {
      const promptWithoutDesc = {
        ...mockSystemPromptResult,
        input: {
          ...mockSystemPromptResult.input,
          schema: {
            type: "object",
            properties: {
              test: {
                type: "string",
                // no description field
              },
            },
            required: ["test"],
          },
        },
      };
      const result = convertToMCPPrompt(promptWithoutDesc);
      expect(result.arguments).toEqual([
        {
          name: "test",
          description: "",
          required: true,
        },
      ]);
    });

    it("should handle schema without required field", () => {
      const promptWithoutRequired = {
        ...mockSystemPromptResult,
        input: {
          ...mockSystemPromptResult.input,
          schema: {
            type: "object",
            properties: {
              test: {
                type: "string",
                description: "test field",
              },
            },
            // no required field
          },
        },
      };
      const result = convertToMCPPrompt(promptWithoutRequired);
      expect(result.arguments).toEqual([
        {
          name: "test",
          description: "test field",
          required: false,
        },
      ]);
    });

    it("should handle schema with non-object property type", () => {
      const promptWithNonObjectProp = {
        ...mockSystemPromptResult,
        input: {
          ...mockSystemPromptResult.input,
          schema: {
            type: "object",
            properties: {
              test1: {
                type: "string",
                description: 123, // non-string description
              },
              test2: "not an object", // non-object property
              test3: null, // null property
            },
            required: ["test1"],
          },
        },
      };
      const result = convertToMCPPrompt(promptWithNonObjectProp);
      expect(result.arguments).toEqual([
        {
          name: "test1",
          description: "123",
          required: true,
        },
      ]);
    });

    it("should handle schema with falsy description values", () => {
      const promptWithFalsyDesc = {
        ...mockSystemPromptResult,
        input: {
          ...mockSystemPromptResult.input,
          schema: {
            type: "object",
            properties: {
              test1: {
                type: "string",
                description: "", // empty string
              },
              test2: {
                type: "string",
                description: null, // null description
              },
              test3: {
                type: "string",
                description: undefined, // undefined description
              },
            },
            required: ["test1", "test2", "test3"],
          },
        },
      };
      const result = convertToMCPPrompt(promptWithFalsyDesc);
      expect(result.arguments).toEqual([
        {
          name: "test1",
          description: "",
          required: true,
        },
        {
          name: "test2",
          description: "",
          required: true,
        },
        {
          name: "test3",
          description: "",
          required: true,
        },
      ]);
    });
  });
});
