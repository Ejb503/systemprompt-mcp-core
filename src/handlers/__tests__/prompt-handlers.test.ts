import { jest } from "@jest/globals";
import type {
  GetPromptResult,
  ListPromptsResult,
  Prompt,
} from "@modelcontextprotocol/sdk/types.js";
import type { SystempromptPromptResponse } from "../../types/systemprompt.js";
import { handleListPrompts, handleGetPrompt } from "../prompt-handlers.js";
import { SystemPromptService } from "../../services/systemprompt-service.js";

// Mock the constants modules
jest.mock("../../constants/instructions.js", () => ({
  NOTION_PAGE_CREATOR_INSTRUCTIONS: "Test assistant instruction",
  NOTION_PAGE_EDITOR_INSTRUCTIONS: "Test editor instruction",
}));

const mockPrompts: SystempromptPromptResponse[] = [
  {
    id: "notion-page-creator",
    metadata: {
      title: "Notion Page Creator",
      description:
        "Generates a rich, detailed Notion page that expands upon basic inputs into comprehensive, well-structured content",
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T00:00:00Z",
      version: 1,
      status: "active",
      author: "test",
      log_message: "Initial version",
    },
    instruction: {
      static: "Test assistant instruction",
      dynamic: "",
      state: "",
    },
    input: {
      name: "notion-page-creator-input",
      description: "Input parameters for creating a Notion page",
      type: ["object"],
      schema: {
        type: "object",
        properties: {
          databaseId: {
            type: "string",
            description: "The ID of the database to create the page in",
          },
          userInstructions: {
            type: "string",
            description: "Basic instructions or outline for the page content",
          },
        },
        required: ["databaseId", "userInstructions"],
      },
    },
    output: {
      name: "notion-page-creator-output",
      description: "Output format for the created Notion page",
      type: ["object"],
      schema: {
        type: "object",
        properties: {},
        required: ["parent", "properties"],
      },
    },
    _link: "https://api.systemprompt.io/v1/prompts/notion-page-creator",
  },
];

type MockGetAllPromptsReturn = ReturnType<
  typeof SystemPromptService.prototype.getAllPrompts
>;

// Mock SystemPromptService
jest.mock("../../services/systemprompt-service.js", () => {
  const mockGetAllPrompts = jest.fn(() => Promise.resolve(mockPrompts));
  const mockGetInstance = jest.fn(() => ({
    getAllPrompts: mockGetAllPrompts,
  }));

  return {
    SystemPromptService: {
      getInstance: mockGetInstance,
      initialize: jest.fn(),
    },
  };
});

describe("Prompt Handlers", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("handleListPrompts", () => {
    it("should return a list of prompts", async () => {
      const result = await handleListPrompts({ method: "prompts/list" });
      expect(result.prompts).toBeDefined();
      expect(result.prompts[0].name).toBe(mockPrompts[0].metadata.title);
    });

    it("should handle errors gracefully", async () => {
      // Override mock for this specific test
      await jest.isolateModules(async () => {
        const mockError = new Error("Failed to fetch");
        const mockGetAllPrompts = jest.fn(() => Promise.reject(mockError));
        const mockGetInstance = jest.fn(() => ({
          getAllPrompts: mockGetAllPrompts,
        }));

        jest.doMock("../../services/systemprompt-service.js", () => ({
          SystemPromptService: {
            getInstance: mockGetInstance,
          },
        }));

        const { handleListPrompts } = await import("../prompt-handlers.js");
        await expect(
          handleListPrompts({ method: "prompts/list" })
        ).rejects.toThrow("Failed to fetch prompts");
      });
    });
  });

  describe("handleGetPrompt", () => {
    it("should handle unknown prompts", async () => {
      await expect(
        handleGetPrompt({
          method: "prompts/get",
          params: { name: "Unknown Prompt" },
        })
      ).rejects.toThrow("Prompt not found: Unknown Prompt");
    });

    it("should return the correct prompt", async () => {
      const result = await handleGetPrompt({
        method: "prompts/get",
        params: {
          name: "Notion Page Creator",
          arguments: {
            databaseId: "test-db-123",
            userInstructions: "Create a test page",
          },
        },
      });

      const prompt = result._meta?.prompt as SystempromptPromptResponse;
      expect(prompt).toBeDefined();
      expect(prompt.metadata.title).toBe("Notion Page Creator");
      expect(prompt.input.schema.properties).toHaveProperty("databaseId");
      expect(prompt.input.schema.properties).toHaveProperty("userInstructions");
    });
  });
});
