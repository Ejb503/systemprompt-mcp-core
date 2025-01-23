import { jest } from "@jest/globals";

// Mock dependencies
const mockCreateMessage = jest.fn() as jest.MockedFunction<
  (params: any) => Promise<any>
>;

// Mock server module
jest.mock("../../server", () => ({
  __esModule: true,
  server: {
    createMessage: mockCreateMessage,
    notification: jest.fn(),
  },
}));

// Import after mocks
import { describe, it, expect } from "@jest/globals";
import { sendSamplingRequest } from "../sampling";
import type {
  CreateMessageRequest,
  CreateMessageResult,
} from "@modelcontextprotocol/sdk/types.js";
import {
  handleCreatePromptCallback,
  handleEditPromptCallback,
  handleCreateBlockCallback,
  handleEditBlockCallback,
  handleCreateAgentCallback,
  handleEditAgentCallback,
} from "../callbacks";

// Mock all callback handlers
jest.mock("../callbacks", () => ({
  handleCreatePromptCallback: jest.fn(),
  handleEditPromptCallback: jest.fn(),
  handleCreateBlockCallback: jest.fn(),
  handleCreateAgentCallback: jest.fn(),
  handleEditBlockCallback: jest.fn(),
  handleEditAgentCallback: jest.fn(),
}));

const mockResult: CreateMessageResult = {
  content: {
    type: "text",
    text: "Test response",
  },
  role: "assistant",
  model: "test-model",
  _meta: {},
};

const validRequest: CreateMessageRequest = {
  method: "sampling/createMessage",
  params: {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "test",
        },
      },
    ],
    maxTokens: 100,
    temperature: 0.7,
    includeContext: "none",
    _meta: {},
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateMessage.mockResolvedValue(mockResult);
  (handleCreatePromptCallback as jest.Mock<any>).mockResolvedValue(
    "create prompt success"
  );
  (handleEditPromptCallback as jest.Mock<any>).mockResolvedValue(
    "edit prompt success"
  );
  (handleCreateBlockCallback as jest.Mock<any>).mockResolvedValue(
    "create block success"
  );
  (handleEditBlockCallback as jest.Mock<any>).mockResolvedValue(
    "edit block success"
  );
  (handleCreateAgentCallback as jest.Mock<any>).mockResolvedValue(
    "create agent success"
  );
  (handleEditAgentCallback as jest.Mock<any>).mockResolvedValue(
    "edit agent success"
  );
});

describe("sampling", () => {
  describe("sendSamplingRequest", () => {
    it("should process sampling request successfully", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "test",
              },
            },
          ],
          maxTokens: 100,
          model: "test-model",
          _meta: {},
        },
      };

      const result = await sendSamplingRequest(request);
      expect(mockCreateMessage).toHaveBeenCalledWith(request.params);
      expect(result).toEqual(mockResult);
    });

    it("should handle callback when provided", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "test",
              },
            },
          ],
          maxTokens: 100,
          model: "test-model",
          _meta: {
            callback: "create_prompt",
          },
        },
      };

      await sendSamplingRequest(request);
      expect(handleCreatePromptCallback).toHaveBeenCalledWith(mockResult);
    });

    it("should handle different callback types", async () => {
      const callbacks = [
        "create_prompt",
        "edit_prompt",
        "create_block",
        "edit_block",
        "create_agent",
        "edit_agent",
      ];

      for (const callback of callbacks) {
        const request: CreateMessageRequest = {
          method: "sampling/createMessage",
          params: {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "test",
                },
              },
            ],
            maxTokens: 100,
            model: "test-model",
            _meta: {
              callback,
            },
          },
        };

        await sendSamplingRequest(request);
      }

      expect(handleCreatePromptCallback).toHaveBeenCalled();
      expect(handleEditPromptCallback).toHaveBeenCalled();
      expect(handleCreateBlockCallback).toHaveBeenCalled();
      expect(handleEditBlockCallback).toHaveBeenCalled();
      expect(handleCreateAgentCallback).toHaveBeenCalled();
      expect(handleEditAgentCallback).toHaveBeenCalled();
    });

    it("should handle unknown callback type", async () => {
      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "test",
              },
            },
          ],
          maxTokens: 100,
          model: "test-model",
          _meta: {
            callback: "unknown",
          },
        },
      };

      const result = await sendSamplingRequest(request);
      expect(result).toEqual(mockResult);
    });

    it("should handle errors in sampling request", async () => {
      const error = new Error("Test error");
      mockCreateMessage.mockRejectedValue(error);

      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "test",
              },
            },
          ],
          maxTokens: 100,
          model: "test-model",
          _meta: {},
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow("Test error");
    });

    it("should handle non-Error objects in error case", async () => {
      mockCreateMessage.mockRejectedValue("string error");

      const request: CreateMessageRequest = {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "test",
              },
            },
          ],
          maxTokens: 100,
          model: "test-model",
          _meta: {},
        },
      };

      await expect(sendSamplingRequest(request)).rejects.toThrow(
        "Failed to process sampling request: string error"
      );
    });
  });

  describe("Message Content Validation", () => {
    it("should throw error for missing content object", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          messages: [{ role: "user" }],
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        "Message must have a content object"
      );
    });

    it("should throw error for missing content type", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          messages: [{ role: "user", content: {} }],
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        "Message content must have a type field"
      );
    });

    it("should throw error for invalid content type", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "invalid",
                text: "Hello",
              },
            },
          ],
          maxTokens: 100,
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        'Content type must be either "text" or "image"'
      );
    });

    it("should throw error for text content without text field", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
              },
            },
          ],
          maxTokens: 100,
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        "Text content must have a string text field"
      );
    });

    it("should throw error for image content without required fields", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "image",
              },
            },
          ],
          maxTokens: 100,
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        /Image content must have a (base64 data|mimeType) field/
      );
    });
  });

  describe("Parameter Validation", () => {
    it("should throw error for invalid temperature", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          temperature: 2,
        },
      };
      await expect(sendSamplingRequest(invalidRequest)).rejects.toThrow(
        "Temperature must be between 0 and 1"
      );
    });

    it("should throw error for invalid maxTokens", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          maxTokens: 0,
        },
      };
      await expect(sendSamplingRequest(invalidRequest)).rejects.toThrow(
        "maxTokens must be a positive number"
      );
    });

    it("should throw error for invalid includeContext", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          includeContext: "invalid",
        },
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        'includeContext must be one of: "none", "thisServer", or "allServers"'
      );
    });

    it("should throw error for invalid model preferences", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          modelPreferences: {
            costPriority: 1.5,
            speedPriority: 0.5,
            intelligencePriority: 0.5,
          },
        },
      };
      await expect(sendSamplingRequest(invalidRequest)).rejects.toThrow(
        "Priority values must be between 0 and 1"
      );
    });
  });
});
