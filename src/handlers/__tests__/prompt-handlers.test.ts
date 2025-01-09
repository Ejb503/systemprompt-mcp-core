import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { SystemPromptService } from "../../services/systemprompt-service.js";
import {
  createPromptHandler,
  editPromptHandler,
  handleListPrompts,
  handleGetPrompt,
} from "../prompt-handlers.js";
import type {
  CreatePromptInput,
  PromptCreationResult,
} from "../../types/index.js";

jest.mock("../../services/systemprompt-service.js");

const mockService = {
  getAllPrompts: jest.fn(),
  createPrompt: jest.fn(),
  editPrompt: jest.fn(),
} as unknown as jest.Mocked<SystemPromptService>;

describe("Prompt Handlers", () => {
  const mockPrompt: PromptCreationResult = {
    id: "test-uuid",
    instruction: {
      static: "Test instruction",
    },
    input: {
      name: "test_input",
      description: "Test input",
      type: ["message"],
    },
    output: {
      name: "test_output",
      description: "Test output",
      type: ["message"],
    },
    metadata: {
      title: "Test Prompt",
      description: "Test description",
      created: "2024-01-01",
      updated: "2024-01-01",
      version: 1,
      status: "draft",
      author: "test",
      log_message: "Created",
    },
    _link: "test-link",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (
      SystemPromptService as jest.MockedClass<typeof SystemPromptService>
    ).mockImplementation(() => mockService);
  });

  describe("handleListPrompts", () => {
    it("should return list of prompts with correct schema", async () => {
      mockService.getAllPrompts.mockResolvedValue([mockPrompt]);

      const result = await handleListPrompts(mockService);

      expect(result).toHaveProperty("prompts");
      expect(result.prompts).toHaveLength(1);
      expect(result.prompts[0]).toEqual({
        name: mockPrompt.metadata.title,
        description: mockPrompt.metadata.description,
        messages: [
          {
            role: "system",
            content: {
              type: "text",
              text: mockPrompt.instruction.static,
            },
          },
        ],
        input_schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: mockPrompt.input.description,
            },
          },
          required: [],
        },
        output_schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: mockPrompt.output.description,
            },
          },
          required: [],
        },
      });
    });

    it("should use default service when not provided", async () => {
      const defaultMockService = {
        getAllPrompts: jest
          .fn<() => Promise<PromptCreationResult[]>>()
          .mockResolvedValue([mockPrompt]),
      } as unknown as jest.Mocked<SystemPromptService>;

      (
        SystemPromptService as jest.MockedClass<typeof SystemPromptService>
      ).mockImplementation(() => defaultMockService);

      const result = await handleListPrompts();
      expect(result).toHaveProperty("prompts");
      expect(result.prompts).toHaveLength(1);
    });
  });

  describe("handleGetPrompt", () => {
    it("should return prompt by name", async () => {
      mockService.getAllPrompts.mockResolvedValue([mockPrompt]);

      const result = await handleGetPrompt(
        {
          params: { name: "Test Prompt" },
        },
        mockService
      );

      expect(result).toEqual({
        name: mockPrompt.metadata.title,
        description: mockPrompt.metadata.description,
        messages: [
          {
            role: "system",
            content: {
              type: "text",
              text: mockPrompt.instruction.static,
            },
          },
        ],
        input_schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: mockPrompt.input.description,
            },
          },
          required: [],
        },
        output_schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: mockPrompt.output.description,
            },
          },
          required: [],
        },
      });
    });

    it("should throw error for unknown prompt", async () => {
      mockService.getAllPrompts.mockResolvedValue([mockPrompt]);

      await expect(
        handleGetPrompt(
          {
            params: { name: "Unknown Prompt" },
          },
          mockService
        )
      ).rejects.toThrow("Unknown prompt");
    });
  });

  describe("createPromptHandler", () => {
    const validInput: CreatePromptInput = {
      instruction: {
        static: "Test instruction",
      },
      input: {
        name: "test_input",
        description: "Test input",
        type: ["message"],
      },
      output: {
        name: "test_output",
        description: "Test output",
        type: ["message"],
      },
      metadata: {
        title: "Test Prompt",
        description: "Test description",
      },
    };

    it("should create a prompt successfully", async () => {
      mockService.createPrompt.mockResolvedValue(mockPrompt);

      const result = await createPromptHandler(mockService, validInput);

      expect(result).toEqual(mockPrompt);
      expect(mockService.createPrompt).toHaveBeenCalledWith(validInput);
    });

    it("should throw error for invalid input", async () => {
      const invalidInput: Partial<CreatePromptInput> = {
        input: validInput.input,
        output: validInput.output,
        metadata: validInput.metadata,
      };

      await expect(
        createPromptHandler(mockService, invalidInput as CreatePromptInput)
      ).rejects.toThrow("Invalid input");
    });
  });

  describe("editPromptHandler", () => {
    const validInput: Partial<CreatePromptInput> = {
      instruction: {
        static: "Updated instruction",
      },
      metadata: {
        title: "Updated Prompt",
        description: "Test description",
      },
    };

    it("should edit a prompt successfully", async () => {
      mockService.editPrompt.mockResolvedValue(mockPrompt);

      const result = await editPromptHandler(
        mockService,
        "test-uuid",
        validInput
      );

      expect(result).toEqual(mockPrompt);
      expect(mockService.editPrompt).toHaveBeenCalledWith(
        "test-uuid",
        validInput
      );
    });

    it("should throw error for invalid UUID", async () => {
      await expect(
        editPromptHandler(mockService, "", validInput)
      ).rejects.toThrow("Invalid UUID");
    });
  });
});
