import type { PromptCreationResult } from "../../types/index.js";
import { jest } from "@jest/globals";
import { SystemPromptService } from "../../services/systemprompt-service.js";
import {
  handleListTools,
  handleToolCall,
  initializeService,
} from "../tool-handlers.js";
import type { ListToolsResult } from "@modelcontextprotocol/sdk/types.js";

jest.mock("../../services/systemprompt-service.js");

describe("Tool Handlers", () => {
  const mockPrompt: PromptCreationResult = {
    id: "test-id",
    instruction: {
      static: "Test instruction",
    },
    input: {
      name: "Test Input",
      description: "Test input description",
      type: ["message"],
      schema: {
        type: "object",
        properties: {},
      },
    },
    output: {
      name: "Test Output",
      description: "Test output description",
      type: ["message"],
      schema: {
        type: "object",
        properties: {},
      },
    },
    metadata: {
      title: "Test Prompt",
      description: "Test description",
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T00:00:00Z",
      version: 1,
      status: "draft",
      author: "test",
      log_message: "Initial creation",
    },
    _link: "test-link",
  };

  const mockService = {
    baseUrl: "https://api.systemprompt.io/v1",
    getAllprompt: jest.fn<() => Promise<PromptCreationResult[]>>(),
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
    it("should throw error for unknown tool", async () => {
      await expect(
        handleToolCall({
          method: "tools/call",
          params: {
            name: "unknownTool",
            arguments: {},
          },
        })
      ).rejects.toThrow("Unknown tool: unknownTool");
    });

    it("should handle undefined arguments", async () => {
      await expect(
        handleToolCall({
          method: "tools/call",
          params: {
            name: "create_prompt",
          },
        })
      ).rejects.toThrow(
        "Failed to create prompt: Cannot read properties of undefined (reading 'title')"
      );
    });

    describe("create_prompt", () => {
      it("should create a new prompt", async () => {
        mockService.createPrompt.mockResolvedValueOnce({
          id: "test-uuid",
          instruction: {
            static: "Test instruction",
          },
          input: {
            name: "Test Input",
            description: "Test input description",
            type: ["message"],
            schema: {
              type: "object",
              properties: {},
            },
          },
          output: {
            name: "Test Output",
            description: "Test output description",
            type: ["message"],
            schema: {
              type: "object",
              properties: {},
            },
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
        });

        const result = await handleToolCall({
          method: "tools/call",
          params: {
            name: "create_prompt",
            arguments: {
              instruction: {
                static: "Test instruction",
              },
              input: {
                name: "Test Input",
                description: "Test input description",
                type: ["message"],
                schema: {
                  type: "object",
                  properties: {},
                },
              },
              output: {
                name: "Test Output",
                description: "Test output description",
                type: ["message"],
                schema: {
                  type: "object",
                  properties: {},
                },
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
            },
          },
        });

        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Created prompt: Test Prompt",
            },
          ],
        });
      });

      it("should create a prompt with minimal required fields", async () => {
        mockService.createPrompt.mockResolvedValueOnce({
          ...mockPrompt,
          metadata: {
            ...mockPrompt.metadata,
            title: "Minimal Prompt",
          },
        });

        const result = await handleToolCall({
          method: "tools/call",
          params: {
            name: "create_prompt",
            arguments: {
              metadata: {
                title: "Minimal Prompt",
                description: "Test description",
              },
              instruction: {
                static: "Test instruction",
              },
              input: {
                name: "test_input",
                description: "Test input description",
                type: ["message"],
                schema: {
                  type: "object",
                  properties: {},
                },
              },
              output: {
                name: "test_output",
                description: "Test output description",
                type: ["message"],
                schema: {
                  type: "object",
                  properties: {},
                },
              },
            },
          },
        });

        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Created prompt: Minimal Prompt",
            },
          ],
        });

        expect(mockService.createPrompt).toHaveBeenCalledWith({
          metadata: {
            title: "Minimal Prompt",
            description: "Test description",
          },
          instruction: {
            static: "Test instruction",
          },
          input: {
            name: "test_input",
            description: "Test input description",
            type: ["message"],
            schema: {
              type: "object",
              properties: {},
            },
          },
          output: {
            name: "test_output",
            description: "Test output description",
            type: ["message"],
            schema: {
              type: "object",
              properties: {},
            },
          },
        });
      });

      it("should handle API errors", async () => {
        mockService.createPrompt.mockRejectedValueOnce(
          new Error("API request failed")
        );

        await expect(
          handleToolCall({
            method: "tools/call",
            params: {
              name: "create_prompt",
              arguments: {
                instruction: {
                  static: "Test instruction",
                },
                input: {
                  name: "Test Input",
                  description: "Test input description",
                  type: ["message"],
                  schema: {
                    type: "object",
                    properties: {},
                  },
                },
                output: {
                  name: "Test Output",
                  description: "Test output description",
                  type: ["message"],
                  schema: {
                    type: "object",
                    properties: {},
                  },
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
              },
            },
          })
        ).rejects.toThrow("Failed to create prompt: API request failed");
      });
    });

    describe("edit_prompt", () => {
      it("should edit an existing prompt", async () => {
        mockService.editPrompt.mockResolvedValueOnce({
          id: "test-uuid",
          instruction: {
            static: "Updated instruction",
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
          metadata: {
            title: "Updated Prompt",
            description: "Updated description",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 2,
            status: "draft",
            author: "test",
            log_message: "Updated",
          },
          _link: "test-link",
        });

        const result = await handleToolCall({
          method: "tools/call",
          params: {
            name: "edit_prompt",
            arguments: {
              uuid: "test-uuid",
              instruction: {
                static: "Updated instruction",
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
              metadata: {
                title: "Updated Prompt",
                description: "Updated description",
                created: "2024-01-01",
                updated: "2024-01-01",
                version: 2,
                status: "draft",
                author: "test",
                log_message: "Updated",
              },
            },
          },
        });

        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Updated prompt: Updated Prompt",
            },
          ],
        });
      });

      it("should edit a prompt with only uuid provided", async () => {
        mockService.editPrompt.mockResolvedValueOnce({
          ...mockPrompt,
          metadata: {
            ...mockPrompt.metadata,
            title: "Existing Prompt",
          },
        });

        const result = await handleToolCall({
          method: "tools/call",
          params: {
            name: "edit_prompt",
            arguments: {
              uuid: "test-uuid",
            },
          },
        });

        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Updated prompt: Existing Prompt",
            },
          ],
        });
        expect(mockService.editPrompt).toHaveBeenCalledWith("test-uuid", {
          uuid: "test-uuid",
        });
      });

      it("should edit a prompt with partial metadata update", async () => {
        mockService.editPrompt.mockResolvedValueOnce({
          ...mockPrompt,
          metadata: {
            ...mockPrompt.metadata,
            title: "Updated Title Only",
          },
        });

        const result = await handleToolCall({
          method: "tools/call",
          params: {
            name: "edit_prompt",
            arguments: {
              uuid: "test-uuid",
              metadata: {
                title: "Updated Title Only",
              },
            },
          },
        });

        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Updated prompt: Updated Title Only",
            },
          ],
        });
        expect(mockService.editPrompt).toHaveBeenCalledWith("test-uuid", {
          uuid: "test-uuid",
          metadata: {
            title: "Updated Title Only",
          },
        });
      });

      it("should handle API errors", async () => {
        mockService.editPrompt.mockRejectedValueOnce(
          new Error("API request failed")
        );

        await expect(
          handleToolCall({
            method: "tools/call",
            params: {
              name: "edit_prompt",
              arguments: {
                uuid: "test-uuid",
                instruction: {
                  static: "Updated instruction",
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
                metadata: {
                  title: "Updated Prompt",
                  description: "Updated description",
                  created: "2024-01-01",
                  updated: "2024-01-01",
                  version: 2,
                  status: "draft",
                  author: "test",
                  log_message: "Updated",
                },
              },
            },
          })
        ).rejects.toThrow("Failed to edit prompt: API request failed");
      });
    });
  });
});
