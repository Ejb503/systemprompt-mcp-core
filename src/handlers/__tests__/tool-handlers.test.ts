import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { SystemPromptService } from "../../services/systemprompt-service.js";
import { handleToolCall } from "../tool-handlers.js";
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { TOOLS } from "../../constants/tools.js";
import type {
  SystempromptPromptRequest,
  SystempromptBlockRequest,
  SystempromptAgentRequest,
} from "../../types/index.js";

// Mock the server config
jest.mock("../../config/server-config.js", () => ({
  serverConfig: {
    port: 3000,
    host: "localhost",
  },
  serverCapabilities: {
    tools: [],
  },
}));

// Mock the main function
jest.mock("../../index.ts", () => {
  const mockNotification = jest.fn().mockImplementation(async () => {});
  return {
    main: jest.fn(),
    server: {
      notification: mockNotification,
    },
  };
});

interface MockPrompt {
  id: string;
  metadata: {
    title: string;
    description: string;
  };
  content: string;
}

const mockPrompt: MockPrompt = {
  id: "prompt123",
  metadata: {
    title: "Test Prompt",
    description: "A test prompt",
  },
  content: "Test content",
};

const mockBlock: MockPrompt = {
  id: "block123",
  metadata: {
    title: "Test Block",
    description: "A test block",
  },
  content: "Test content",
};

const mockAgent: MockPrompt = {
  id: "agent123",
  metadata: {
    title: "Test Agent",
    description: "A test agent",
  },
  content: "Test content",
};

interface UserStatus {
  user: {
    name: string;
    email: string;
    roles: string[];
  };
  billing: {
    customer: {
      id: string;
      email: string;
      status: string;
    };
    subscription: Array<{
      id: string;
      status: string;
      currency_code: string;
      billing_cycle: {
        frequency: number;
        interval: string;
      };
      current_billing_period: {
        starts_at: string;
        ends_at: string;
      };
      items: Array<{
        product: { name: string };
        price: {
          unit_price: { amount: string; currency_code: string };
        };
      }>;
    }>;
  };
  api_key: string;
}

// Mock SystemPromptService with proper types
const mockSystemPromptService = {
  fetchUserStatus: jest.fn<() => Promise<UserStatus>>().mockResolvedValue({
    user: {
      name: "Test User",
      email: "test@example.com",
      roles: ["user"],
    },
    billing: {
      customer: {
        id: "cust123",
        email: "test@example.com",
        status: "active",
      },
      subscription: [
        {
          id: "sub123",
          status: "active",
          currency_code: "USD",
          billing_cycle: {
            frequency: 1,
            interval: "month",
          },
          current_billing_period: {
            starts_at: "2024-01-01T00:00:00Z",
            ends_at: "2024-02-01T00:00:00Z",
          },
          items: [
            {
              product: { name: "Pro Plan" },
              price: {
                unit_price: { amount: "1000", currency_code: "USD" },
              },
            },
          ],
        },
      ],
    },
    api_key: "test-api-key",
  }),
  getAllPrompts: jest
    .fn<() => Promise<MockPrompt[]>>()
    .mockResolvedValue([mockPrompt]),
  listBlocks: jest
    .fn<() => Promise<MockPrompt[]>>()
    .mockResolvedValue([mockBlock]),
  listAgents: jest
    .fn<() => Promise<MockPrompt[]>>()
    .mockResolvedValue([mockAgent]),
  createPrompt: jest
    .fn<() => Promise<MockPrompt>>()
    .mockResolvedValue(mockPrompt),
  editPrompt: jest
    .fn<() => Promise<MockPrompt>>()
    .mockResolvedValue(mockPrompt),
  deletePrompt: jest.fn<() => Promise<{}>>().mockResolvedValue({}),
  deleteBlock: jest.fn<() => Promise<{}>>().mockResolvedValue({}),
  createBlock: jest
    .fn<() => Promise<MockPrompt>>()
    .mockResolvedValue(mockBlock),
  editBlock: jest.fn<() => Promise<MockPrompt>>().mockResolvedValue(mockBlock),
  createAgent: jest
    .fn<() => Promise<MockPrompt>>()
    .mockResolvedValue(mockAgent),
  editAgent: jest.fn<() => Promise<MockPrompt>>().mockResolvedValue(mockAgent),
};

// Mock the SystemPromptService module
jest.mock("../../services/systemprompt-service.js", () => ({
  SystemPromptService: {
    getInstance: jest.fn(() => mockSystemPromptService),
  },
}));

// Mock the prompt handlers
jest.mock("../prompt-handlers.js", () => ({
  handleGetPrompt: jest.fn().mockImplementation(async () => ({
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "Test prompt",
        },
      },
    ],
  })),
}));

interface SamplingResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

// Mock the sampling module
jest.mock("../sampling.js", () => {
  const mockFn = jest.fn();
  mockFn.mockImplementation(async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify({
          metadata: {
            title: "Test Resource",
            description: "A test resource",
          },
          content: "Test content",
        }),
      },
    ],
  }));
  return { sendSamplingRequest: mockFn };
});

describe("Tool Handlers", () => {
  let mockSamplingModule: { sendSamplingRequest: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSamplingModule = require("../sampling.js");

    // Set up default mock implementation for sampling requests
    mockSamplingModule.sendSamplingRequest.mockImplementation(async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            metadata: {
              title: "Test Resource",
              description: "A test resource",
            },
            content: "Test content",
          }),
        },
      ],
    }));
  });

  describe("handleToolCall", () => {
    describe("Heartbeat", () => {
      it("should handle systemprompt_heartbeat", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_heartbeat",
            params: {},
          },
        };

        const result = await handleToolCall(request);
        expect(mockSystemPromptService.fetchUserStatus).toHaveBeenCalled();
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toContain("API Key");
        expect(result.content[0].text).toContain("User Information");
        expect(result.content[0].text).toContain("Billing");
      });

      it("should handle empty subscription list in heartbeat", async () => {
        mockSystemPromptService.fetchUserStatus.mockResolvedValueOnce({
          user: {
            name: "Test User",
            email: "test@example.com",
            roles: ["user"],
          },
          billing: {
            customer: {
              id: "cust123",
              email: "test@example.com",
              status: "active",
            },
            subscription: [],
          },
          api_key: "test-api-key",
        });

        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_heartbeat",
            params: {},
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toContain("API Key");
        expect(result.content[0].text).toContain("User Information");
        expect(result.content[0].text).toContain("Billing");
      });

      it("should handle empty resource lists in fetch resources", async () => {
        mockSystemPromptService.getAllPrompts.mockResolvedValueOnce([]);
        mockSystemPromptService.listBlocks.mockResolvedValueOnce([]);
        mockSystemPromptService.listAgents.mockResolvedValueOnce([]);

        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_fetch_resources",
            params: {},
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toContain("Agents");
        expect(result.content[0].text).toContain("Prompts");
        expect(result.content[0].text).toContain("Resources");
      });
    });

    describe("Resource Operations", () => {
      it("should handle systemprompt_fetch_resources", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_fetch_resources",
            params: {},
          },
        };

        const result = await handleToolCall(request);
        expect(mockSystemPromptService.getAllPrompts).toHaveBeenCalled();
        expect(mockSystemPromptService.listBlocks).toHaveBeenCalled();
        expect(mockSystemPromptService.listAgents).toHaveBeenCalled();
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toContain("Agents");
        expect(result.content[0].text).toContain("Prompts");
        expect(result.content[0].text).toContain("Resources");
      });

      it("should handle create resource request", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_resource",
            arguments: {
              type: "block",
              userInstructions: "Create a test block",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toBe(
          "Your request has been recieved and is being processed, we will notify you when it is complete."
        );
      });

      it("should handle update resource request", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_update_resource",
            arguments: {
              id: "test-id",
              type: "block",
              userInstructions: "Update test block",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toBe(
          "Your request has been recieved and is being processed, we will notify you when it is complete."
        );
      });

      it("should handle systemprompt_delete_resource", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_delete_resource",
            arguments: {
              id: "test-id",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result).toBeDefined();
      });

      it("should handle invalid resource type for create", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_resource",
            arguments: {
              type: "invalid",
              userInstructions: "Create an invalid resource",
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Invalid resource type: invalid"
        );
      });

      it("should handle invalid resource type for update", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_update_resource",
            arguments: {
              id: "test-id",
              type: "invalid",
              userInstructions: "Update an invalid resource",
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Invalid resource type: invalid"
        );
      });

      it("should handle delete resource failure", async () => {
        mockSystemPromptService.deletePrompt.mockRejectedValueOnce(
          new Error("Failed to delete prompt")
        );
        mockSystemPromptService.deleteBlock.mockRejectedValueOnce(
          new Error("Failed to delete block")
        );

        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_delete_resource",
            arguments: {
              id: "nonexistent123",
            },
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Failed to delete resource with ID nonexistent123"
        );
      });

      it("should handle missing id for delete resource", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_delete_resource",
            arguments: {},
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "ID is required for deleting a resource"
        );
      });

      it("should handle invalid params for create resource", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_create_resource",
            arguments: {},
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Tool call failed: Missing required parameters - type and userInstructions are required"
        );
      });

      it("should handle invalid params for update resource", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_update_resource",
            arguments: {},
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Tool call failed: Missing required parameters - id, type and userInstructions are required"
        );
      });

      it("should handle successful block deletion", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_delete_resource",
            arguments: {
              id: "test-block-id",
            },
          },
        };

        const result = await handleToolCall(request);
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toBe(
          "Successfully deleted prompt test-block-id"
        );
      });
    });

    describe("Error Handling", () => {
      it("should handle invalid tool name", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "invalid_tool",
            params: {},
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow(
          "Unknown tool: invalid_tool"
        );
      });

      it("should handle service errors", async () => {
        mockSystemPromptService.fetchUserStatus.mockRejectedValueOnce(
          new Error("Service error")
        );

        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_heartbeat",
            params: {},
          },
        };

        await expect(handleToolCall(request)).rejects.toThrow("Service error");
      });
    });
  });
});
