import { jest } from "@jest/globals";
import { SystemPromptService } from "../../services/systemprompt-service.js";
import { handleListTools, handleToolCall } from "../tool-handlers.js";
import type { JSONSchema7 } from "json-schema";
import type {
  SystempromptPromptAPIRequest,
  SystempromptPromptResponse,
  SystempromptPromptRequest,
} from "../../types/index.js";

jest.mock("../../services/systemprompt-service.js");

describe("Tool Handlers", () => {
  const mockSchema: JSONSchema7 = {
    type: "object",
    properties: {
      test: { type: "string" },
    },
  };

  const mockResponse: SystempromptPromptResponse = {
    id: "test-uuid",
    instruction: {
      static: "Test instruction",
      dynamic: "",
      state: "",
    },
    input: {
      name: "test_input",
      description: "Test input",
      type: ["message"],
      schema: mockSchema,
    },
    output: {
      name: "test_output",
      description: "Test output",
      type: ["message"],
      schema: mockSchema,
    },
    metadata: {
      title: "Test Prompt",
      description: "Test description",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      version: 1,
      status: "draft",
      author: "test",
      log_message: "Created",
    },
    _link: "test-link",
  };

  const mockService = {
    apiKey: "test-key",
    baseUrl: "https://api.test.com",
    request: jest.fn(),
    getAllPrompts: jest.fn<() => Promise<SystempromptPromptResponse[]>>(),
    createPrompt: jest
      .fn<
        (
          data: SystempromptPromptAPIRequest
        ) => Promise<SystempromptPromptResponse>
      >()
      .mockImplementation(async (data) => mockResponse),
    editPrompt:
      jest.fn<
        (
          uuid: string,
          data: Partial<SystempromptPromptAPIRequest>
        ) => Promise<SystempromptPromptResponse>
      >(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    SystemPromptService.initialize("test-api-key");
    jest
      .spyOn(SystemPromptService, "getInstance")
      .mockReturnValue(mockService as unknown as SystemPromptService);
  });

  describe("handleListTools", () => {
    it("should return list of available tools", async () => {
      const result = await handleListTools({ method: "tools/list" });

      expect(Array.isArray(result.tools)).toBe(true);
      expect(result.tools.length).toBeGreaterThan(0);
      result.tools.forEach((tool) => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();
      });
    });
  });

  describe("handleToolCall", () => {
    describe("systemprompt_create_prompt", () => {
      it("should create a new prompt", async () => {
        const mockResponse: SystempromptPromptResponse = {
          id: "test-uuid",
          instruction: {
            static: "Test instruction",
            dynamic: "",
            state: "",
          },
          input: {
            name: "test_input",
            description: "Test input",
            type: ["message"],
            schema: mockSchema,
          },
          output: {
            name: "test_output",
            description: "Test output",
            type: ["message"],
            schema: mockSchema,
          },
          metadata: {
            title: "Test Prompt",
            description: "Test description",
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            version: 1,
            status: "draft",
            author: "test",
            log_message: "Created",
          },
          _link: "test-link",
        };

        mockService.createPrompt.mockResolvedValueOnce(mockResponse);

        console.log("About to call handleToolCall");
        const result = await handleToolCall({
          method: "tools/call",
          params: {
            name: "systemprompt_create_prompt",
            arguments: {
              title: "Test Prompt",
              description: "Test description",
              static_instruction: "Test instruction",
              dynamic_instruction: "{{message}}",
              state: "{{conversation.history}}",
              input_type: ["message"],
              output_type: ["message"],
            },
          },
        });
        console.log("handleToolCall result:", result);

        expect(result).toBeDefined();
        console.log("About to check createPrompt call");
        expect(mockService.createPrompt).toHaveBeenCalledWith({
          metadata: {
            title: "Test Prompt",
            description: "Test description",
          },
          instruction: {
            static: "Test instruction",
            dynamic: "{{message}}",
            state: "{{conversation.history}}",
          },
          input: {
            type: ["message"],
            schema: {},
            name: "Test PromptinputSchema",
            description: "Test PromptinputDescription",
          },
          output: {
            type: ["message"],
            schema: {},
            name: "Test PromptoutputSchema",
            description: "Test PromptoutputDescription",
          },
        });
      });

      it("should handle errors", async () => {
        const error = new Error("Failed to create prompt");
        mockService.createPrompt.mockRejectedValueOnce(error);

        await expect(
          handleToolCall({
            method: "tools/call",
            params: {
              name: "systemprompt_create_prompt",
              arguments: {
                title: "Test Prompt",
                description: "Test description",
                static_instruction: "Test instruction",
                dynamic_instruction: "{{message}}",
                state: "{{conversation.history}}",
                input_type: ["message"],
                output_type: ["message"],
              },
            },
          })
        ).rejects.toThrow(
          "Failed to systemprompt create_prompt: Failed to create prompt"
        );
      });
    });
  });
});
