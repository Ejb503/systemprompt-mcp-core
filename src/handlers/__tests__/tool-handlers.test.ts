import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type {
  Tool,
  PromptCreationResult,
  BlockCreationResult,
  CreatePromptInput,
  EditPromptInput,
  CreateBlockInput,
  EditBlockInput,
} from "../../types/index.js";

// Mock the SystemPromptService
const mockCreatePrompt =
  jest.fn<(data: CreatePromptInput) => Promise<PromptCreationResult>>();
const mockEditPrompt =
  jest.fn<
    (
      uuid: string,
      data: Partial<CreatePromptInput>
    ) => Promise<PromptCreationResult>
  >();
const mockCreateBlock =
  jest.fn<(data: CreateBlockInput) => Promise<BlockCreationResult>>();
const mockEditBlock =
  jest.fn<
    (
      uuid: string,
      data: Partial<CreateBlockInput>
    ) => Promise<BlockCreationResult>
  >();

jest.mock("../../services/systemprompt-service.js", () => ({
  SystemPromptService: jest.fn(() => ({
    createPrompt: mockCreatePrompt,
    editPrompt: mockEditPrompt,
    createBlock: mockCreateBlock,
    editBlock: mockEditBlock,
  })),
}));

import { handleListTools, handleToolCall } from "../tool-handlers.js";
import { SystemPromptService } from "../../services/systemprompt-service.js";

describe("Tool Handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleListTools", () => {
    it("should return list of available tools", () => {
      const result = handleListTools();
      expect(Array.isArray(result.tools)).toBe(true);
      expect(result.tools.length).toBeGreaterThan(0);
      result.tools.forEach((tool: Tool) => {
        expect(tool).toHaveProperty("name");
        expect(tool).toHaveProperty("description");
        expect(tool).toHaveProperty("inputSchema");
      });
    });
  });

  describe("handleToolCall", () => {
    describe("create_prompt", () => {
      it("should create a prompt successfully", async () => {
        const mockResult: PromptCreationResult = {
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

        mockCreatePrompt.mockResolvedValueOnce(mockResult);

        const result = await handleToolCall({
          params: {
            name: "create_prompt",
            arguments: {
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
            },
          },
        });

        expect(result).toHaveProperty("content");
        expect(result.content[0]).toEqual({
          type: "text",
          text: `Created prompt with ID: ${mockResult.id}`,
        });
      });
    });

    describe("edit_prompt", () => {
      it("should edit a prompt successfully", async () => {
        const mockResult: PromptCreationResult = {
          id: "test-uuid",
          instruction: {
            static: "Updated instruction",
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
            title: "Updated Prompt",
            description: "Test description",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 2,
            status: "draft",
            author: "test",
            log_message: "Updated",
          },
          _link: "test-link",
        };

        mockEditPrompt.mockResolvedValueOnce(mockResult);

        const result = await handleToolCall({
          params: {
            name: "edit_prompt",
            arguments: {
              uuid: "test-uuid",
              instruction: {
                static: "Updated instruction",
              },
              metadata: {
                title: "Updated Prompt",
              },
            },
          },
        });

        expect(result).toHaveProperty("content");
        expect(result.content[0]).toEqual({
          type: "text",
          text: `Updated prompt with ID: ${mockResult.id}`,
        });
      });
    });

    describe("create_block", () => {
      it("should create a block successfully", async () => {
        const mockResult: BlockCreationResult = {
          id: "test-uuid",
          content: "Test block content",
          prefix: "test_block",
          metadata: {
            title: "Test Block",
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

        mockCreateBlock.mockResolvedValueOnce(mockResult);

        const result = await handleToolCall({
          params: {
            name: "create_block",
            arguments: {
              content: "Test block content",
              prefix: "test_block",
              metadata: {
                title: "Test Block",
                description: "Test description",
              },
            },
          },
        });

        expect(result).toHaveProperty("content");
        expect(result.content[0]).toEqual({
          type: "text",
          text: `Created block with ID: ${mockResult.id}`,
        });
      });
    });

    describe("edit_block", () => {
      it("should edit a block successfully", async () => {
        const mockResult: BlockCreationResult = {
          id: "test-uuid",
          content: "Updated block content",
          prefix: "test_block",
          metadata: {
            title: "Updated Block",
            description: "Test description",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 2,
            status: "draft",
            author: "test",
            log_message: "Updated",
          },
          _link: "test-link",
        };

        mockEditBlock.mockResolvedValueOnce(mockResult);

        const result = await handleToolCall({
          params: {
            name: "edit_block",
            arguments: {
              uuid: "test-uuid",
              content: "Updated block content",
              metadata: {
                title: "Updated Block",
              },
            },
          },
        });

        expect(result).toHaveProperty("content");
        expect(result.content[0]).toEqual({
          type: "text",
          text: `Updated block with ID: ${mockResult.id}`,
        });
      });
    });

    describe("error handling", () => {
      it("should propagate service errors", async () => {
        mockCreatePrompt.mockRejectedValueOnce(new Error("Service error"));

        await expect(
          handleToolCall({
            params: {
              name: "create_prompt",
              arguments: {
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
              },
            },
          })
        ).rejects.toThrow("Service error");
      });
    });

    describe("unknown tool", () => {
      it("should throw error for unknown tool", async () => {
        await expect(
          handleToolCall({
            params: {
              name: "unknown_tool",
              arguments: {},
            },
          })
        ).rejects.toThrow("Unknown tool");
      });
    });
  });
});
