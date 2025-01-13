import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { handleListTools, handleToolCall } from "../tool-handlers";
import { SystemPromptService } from "../../services/systemprompt-service";
import type { SystempromptPromptResponse } from "../../types/index";

// Manually mock the SDK modules
const mockServer = {
  start: jest.fn(),
  stop: jest.fn(),
  onRequest: jest.fn(),
  registerHandler: jest.fn(),
  registerHandlers: jest.fn(),
};

const mockTransport = {
  start: jest.fn(),
  stop: jest.fn(),
  onRequest: jest.fn(),
};

jest.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  __esModule: true,
  StdioServerTransport: jest.fn(() => mockTransport),
}));

jest.mock("@modelcontextprotocol/sdk/server/index.js", () => ({
  __esModule: true,
  Server: jest.fn(() => mockServer),
}));

// Mock the SystemPromptService class
const mockGetInstance = jest.fn();
jest.mock("../../services/systemprompt-service", () => ({
  SystemPromptService: {
    getInstance: () => mockGetInstance(),
    initialize: jest.fn(),
  },
}));

describe("Tool Handlers", () => {
  let mockService: jest.Mocked<SystemPromptService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      createPrompt: jest.fn(),
      editPrompt: jest.fn(),
      deletePrompt: jest.fn(),
      createBlock: jest.fn(),
      editBlock: jest.fn(),
      deleteBlock: jest.fn(),
      getBlock: jest.fn(),
      getAllPrompts: jest.fn(),
      listBlocks: jest.fn(),
      request: jest.fn(),
    } as any;
    mockGetInstance.mockReturnValue(mockService);
  });

  describe("handleListTools", () => {
    it("should return list of available tools", async () => {
      const request = {
        method: "tools/list" as const,
      };

      const result = await handleListTools(request);

      expect(Array.isArray(result.tools)).toBe(true);
      expect(result.tools.length).toBeGreaterThan(0);

      // Verify the structure of each tool
      result.tools.forEach((tool) => {
        expect(tool).toMatchObject({
          name: expect.stringMatching(/^systemprompt_/),
          description: expect.any(String),
          inputSchema: expect.objectContaining({
            type: "object",
            properties: expect.any(Object),
          }),
        });
      });

      // Verify specific tools exist
      const toolNames = result.tools.map((t) => t.name);
      expect(toolNames).toContain("systemprompt_create_prompt");
      expect(toolNames).toContain("systemprompt_edit_prompt");
      expect(toolNames).toContain("systemprompt_create_resource");
    });
  });

  describe("handleToolCall", () => {
    it("should handle create prompt request", async () => {
      const mockPrompt: SystempromptPromptResponse = {
        id: "test-id",
        instruction: {
          static: "Test instruction",
          dynamic: "",
          state: "",
        },
        input: {
          name: "test_input",
          description: "Test input description",
          type: ["message"],
          schema: {},
        },
        output: {
          name: "test_output",
          description: "Test output description",
          type: ["message"],
          schema: {},
        },
        metadata: {
          title: "Test prompt",
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

      mockService.createPrompt.mockResolvedValue(mockPrompt);

      const request = {
        method: "tools/call" as const,
        params: {
          name: "systemprompt_create_prompt",
          arguments: {
            title: "Test prompt",
            description: "Test description",
            static_instruction: "Test instruction",
            dynamic_instruction: "",
            state: "",
            input_type: ["message"],
            output_type: ["message"],
          },
        },
      };

      const result = await handleToolCall(request);

      expect(result).toBeDefined();
      expect(result.content).toEqual([
        { type: "text", text: "Created prompt: Test prompt" },
      ]);
      expect(mockService.createPrompt).toHaveBeenCalled();
    });

    it("should handle invalid tool name", async () => {
      const request = {
        method: "tools/call" as const,
        params: {
          name: "invalid_tool" as any,
          arguments: {},
        },
      };

      await expect(handleToolCall(request)).rejects.toThrow(
        "Unknown tool: invalid_tool"
      );
    });

    it("should handle service errors", async () => {
      mockService.createPrompt.mockRejectedValue(new Error("Service error"));

      const request = {
        method: "tools/call" as const,
        params: {
          name: "systemprompt_create_prompt",
          arguments: {
            title: "Test prompt",
            description: "Test description",
            static_instruction: "Test instruction",
            dynamic_instruction: "",
            state: "",
            input_type: ["message"],
            output_type: ["message"],
          },
        },
      };

      await expect(handleToolCall(request)).rejects.toThrow(
        "Failed to systemprompt create_prompt: Service error"
      );
    });
  });
});
