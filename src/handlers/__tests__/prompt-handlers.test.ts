import { jest } from "@jest/globals";
import { SystemPromptService } from "../../services/systemprompt-service.js";
import {
  handleListPrompts,
  handleGetPrompt,
  initializeService,
  convertToMCPPrompt,
} from "../prompt-handlers.js";
import type { PromptCreationResult } from "../../types/index.js";
import type { JSONSchema7TypeName } from "json-schema";
import {
  mockSystemPromptResult,
  mockArrayPromptResult,
  mockNestedPromptResult,
  mockMCPPrompt,
  mockArrayMCPPrompt,
  mockNestedMCPPrompt,
  mockEmptyPropsPrompt,
  mockInvalidPropsPrompt,
  mockWithoutDescPrompt,
  mockWithoutRequiredPrompt,
  mockFalsyDescPrompt,
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
        type: "object" as JSONSchema7TypeName,
        properties: {},
      },
    },
    output: {
      name: "test_output",
      description: "Test output",
      type: ["message"],
      schema: {
        type: "object" as JSONSchema7TypeName,
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
    jest.spyOn(SystemPromptService, "getInstance").mockReturnValue(mockService);
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
      const result = convertToMCPPrompt(mockEmptyPropsPrompt);
      expect(result.arguments).toEqual([]);
    });

    it("should handle null or invalid schema properties", () => {
      const result = convertToMCPPrompt(mockInvalidPropsPrompt);
      expect(result.arguments).toEqual([
        {
          name: "test1",
          description: "",
          required: false,
        },
      ]);
    });

    it("should handle schema property without description", () => {
      const result = convertToMCPPrompt(mockWithoutDescPrompt);
      expect(result.arguments).toEqual([
        {
          name: "test",
          description: "",
          required: true,
        },
      ]);
    });

    it("should handle schema without required field", () => {
      const result = convertToMCPPrompt(mockWithoutRequiredPrompt);
      expect(result.arguments).toEqual([
        {
          name: "test",
          description: "test field",
          required: false,
        },
      ]);
    });

    it("should handle schema with falsy description values", () => {
      const result = convertToMCPPrompt(mockFalsyDescPrompt);
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
