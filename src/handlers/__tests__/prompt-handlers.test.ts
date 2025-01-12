import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { CreatePromptInput, PromptCreationResult } from "@/types/index.js";
import {
  handleListPrompts,
  handleGetPrompt,
  createPromptHandler,
  editPromptHandler,
} from "../prompt-handlers.js";

// Import the service before mocking to get its type information
import { PromptService } from "@/services/prompt-service.js";

// Mock the entire module
jest.mock("@/services/prompt-service.js");

// Sample test data
const testPrompt: PromptCreationResult = {
  id: "123",
  instruction: {
    static: "Test static instruction",
    dynamic: "Test dynamic instruction",
    state: "Test state"
  },
  input: {
    name: "test_input",
    description: "Test input description",
    type: ["message"]
  },
  output: {
    name: "test_output",
    description: "Test output description",
    type: ["message"]
  },
  metadata: {
    title: "Test Prompt",
    description: "Test prompt description",
    created: "2024-01-01",
    updated: "2024-01-01",
    version: 1,
    status: "draft",
    author: "test-author",
    log_message: "Initial creation"
  },
  _link: "test-link"
};

let service: jest.Mocked<PromptService>;

beforeEach(() => {
  jest.clearAllMocks();
  // Create a new mocked instance before each test
  const MockedPromptService = jest.mocked(PromptService);
  service = new MockedPromptService() as jest.Mocked<PromptService>;
  
  // Setup default mock implementations
  service.getAllPrompts = jest.fn();
  service.createPrompt = jest.fn();
  service.editPrompt = jest.fn();
});

describe("Prompt Handlers", () => {
  describe("handleListPrompts", () => {
    it("should transform prompts into expected format", async () => {
      // Setup
      service.getAllPrompts.mockResolvedValue([testPrompt]);

      // Execute
      const result = await handleListPrompts(service);

      // Verify
      expect(result).toEqual({
        prompts: [{
          name: testPrompt.metadata.title,
          description: testPrompt.metadata.description,
          messages: [{
            role: "system",
            content: {
              type: "text",
              text: testPrompt.instruction.static
            }
          }],
          input_schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: testPrompt.input.description
              }
            },
            required: []
          },
          output_schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: testPrompt.output.description
              }
            },
            required: []
          }
        }]
      });
    });

    it("should handle empty prompt list", async () => {
      // Setup
      service.getAllPrompts.mockResolvedValue([]);

      // Execute
      const result = await handleListPrompts(service);

      // Verify
      expect(result.prompts).toEqual([]);
    });

    it("should propagate service errors", async () => {
      // Setup
      service.getAllPrompts.mockRejectedValue(new Error("Service unavailable"));

      // Execute & Verify
      await expect(handleListPrompts(service)).rejects.toThrow("Service unavailable");
    });
  });

  describe("handleGetPrompt", () => {
    it("should return single prompt by name", async () => {
      // Setup
      service.getAllPrompts.mockResolvedValue([testPrompt]);
      const request = { params: { name: "Test Prompt" } };

      // Execute
      const result = await handleGetPrompt(request, service);

      // Verify
      expect(result.name).toBe(testPrompt.metadata.title);
      expect(result.description).toBe(testPrompt.metadata.description);
    });

    it("should throw for non-existent prompt", async () => {
      // Setup
      service.getAllPrompts.mockResolvedValue([testPrompt]);
      const request = { params: { name: "Non-existent Prompt" } };

      // Execute & Verify
      await expect(handleGetPrompt(request, service))
        .rejects.toThrow("Unknown prompt");
    });
  });

  describe("createPromptHandler", () => {
    const validInput: CreatePromptInput = {
      instruction: {
        static: "New instruction"
      },
      input: {
        name: "new_input",
        description: "New input description",
        type: ["message"]
      },
      output: {
        name: "new_output",
        description: "New output description",
        type: ["message"]
      },
      metadata: {
        title: "New Prompt",
        description: "New description"
      }
    };

    it("should create prompt with valid input", async () => {
      // Setup
      service.createPrompt.mockResolvedValue({
        ...testPrompt,
        instruction: validInput.instruction,
        metadata: { ...testPrompt.metadata, ...validInput.metadata }
      });

      // Execute
      const result = await createPromptHandler(service, validInput);

      // Verify
      expect(service.createPrompt).toHaveBeenCalledWith(validInput);
      expect(result.instruction).toEqual(validInput.instruction);
      expect(result.metadata.title).toBe(validInput.metadata.title);
    });

    it("should validate required fields", async () => {
      // Setup - create an invalid input by omitting required fields
      const invalidInput = {
        input: validInput.input,
        output: validInput.output,
        metadata: validInput.metadata
        // Intentionally omit instruction to test validation
      } as CreatePromptInput;

      // Execute & Verify
      await expect(createPromptHandler(service, invalidInput))
        .rejects.toThrow("Invalid input");
    });
  });

  describe("editPromptHandler", () => {
    const editInput: Partial<CreatePromptInput> = {
      instruction: {
        static: "Updated instruction"
      },
      metadata: {
        title: "Updated Title",
        description: "Updated description"
      }
    };

    it("should update prompt with valid changes", async () => {
      // Setup
      const promptId = "test-id";
      service.editPrompt.mockResolvedValue({
        ...testPrompt,
        instruction: editInput.instruction!,
        metadata: { ...testPrompt.metadata, ...editInput.metadata }
      });

      // Execute
      const result = await editPromptHandler(service, promptId, editInput);

      // Verify
      expect(service.editPrompt).toHaveBeenCalledWith(promptId, editInput);
      expect(result.instruction).toEqual(editInput.instruction);
      expect(result.metadata.title).toBe(editInput.metadata!.title);
    });

    it("should validate prompt ID", async () => {
      // Execute & Verify
      await expect(editPromptHandler(service, "", editInput))
        .rejects.toThrow("Invalid UUID");
    });

    it("should handle empty update data", async () => {
      // Setup
      service.editPrompt.mockResolvedValue(testPrompt);

      // Execute & Verify
      await expect(editPromptHandler(service, "test-id", {}))
        .resolves.toBeDefined();
    });
  });
});
