import { jest } from "@jest/globals";
import { SystemPromptService } from "../../services/systemprompt-service.js";
import { handleListPrompts, handleGetPrompt } from "../prompt-handlers.js";
import { SystempromptPromptResponse } from "../../types/index.js";

jest.mock("../../services/systemprompt-service.js");

describe("Prompt Handlers", () => {
  const mockPrompt: SystempromptPromptResponse = {
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
      schema: {},
    },
    output: {
      name: "test_output",
      description: "Test output",
      type: ["message"],
      schema: {},
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

  const mockService = {
    apiKey: "test-key",
    baseUrl: "https://api.test.com",
    request: jest.fn(),
    getAllPrompts: jest.fn<() => Promise<SystempromptPromptResponse[]>>(),
    createPrompt:
      jest.fn<
        (
          data: Partial<SystempromptPromptResponse>
        ) => Promise<SystempromptPromptResponse>
      >(),
    editPrompt:
      jest.fn<
        (
          uuid: string,
          data: Partial<SystempromptPromptResponse>
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

  describe("handleListPrompts", () => {
    it("should return list of prompts with correct schema", async () => {
      mockService.getAllPrompts.mockResolvedValueOnce([mockPrompt]);

      const result = await handleListPrompts({ method: "prompts/list" });

      expect(result.prompts).toBeDefined();
      expect(Array.isArray(result.prompts)).toBe(true);
      expect(result.prompts.length).toBe(1);
      expect(result.prompts[0]).toEqual({
        name: mockPrompt.metadata.title,
        description: mockPrompt.metadata.description,
        arguments: [],
      });
      expect(result._meta).toEqual({});
    });

    it("should handle API errors", async () => {
      mockService.getAllPrompts.mockRejectedValueOnce(
        new Error("API request failed")
      );

      await expect(
        handleListPrompts({ method: "prompts/list" })
      ).rejects.toThrow("Failed to fetch prompts from systemprompt.io");
    });
  });

  describe("handleGetPrompt", () => {
    it("should return prompt by name", async () => {
      mockService.getAllPrompts.mockResolvedValueOnce([mockPrompt]);

      const result = await handleGetPrompt({
        method: "prompts/get",
        params: { name: "Test Prompt" },
      });

      expect(result).toEqual({
        _meta: {},
        tools: [],
        id: mockPrompt.id,
        metadata: {
          title: mockPrompt.metadata.title,
          description: mockPrompt.metadata.description,
          created: mockPrompt.metadata.created,
          updated: mockPrompt.metadata.updated,
          version: mockPrompt.metadata.version,
          status: mockPrompt.metadata.status,
          author: mockPrompt.metadata.author,
          log_message: mockPrompt.metadata.log_message,
        },
        instruction: {
          static: mockPrompt.instruction.static,
          dynamic: mockPrompt.instruction.dynamic,
          state: mockPrompt.instruction.state,
        },
        input: {
          name: mockPrompt.input.name,
          description: mockPrompt.input.description,
          type: mockPrompt.input.type,
          schema: mockPrompt.input.schema,
        },
        output: {
          name: mockPrompt.output.name,
          description: mockPrompt.output.description,
          type: mockPrompt.output.type,
          schema: mockPrompt.output.schema,
        },
        messages: [],
        _link: mockPrompt._link,
      });
    });

    it("should throw error for unknown prompt", async () => {
      mockService.getAllPrompts.mockResolvedValueOnce([mockPrompt]);

      await expect(
        handleGetPrompt({
          method: "prompts/get",
          params: { name: "Unknown Prompt" },
        })
      ).rejects.toThrow("Prompt not found: Unknown Prompt");
    });

    it("should handle API errors", async () => {
      mockService.getAllPrompts.mockRejectedValueOnce(
        new Error("API request failed")
      );

      await expect(
        handleGetPrompt({
          method: "prompts/get",
          params: { name: "Test Prompt" },
        })
      ).rejects.toThrow(
        "Failed to fetch prompt from systemprompt.io: API request failed"
      );
    });
  });
});
