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
  },
}));

jest.mock("../../utils/message-handlers", () => ({
  handleCallback: jest
    .fn()
    .mockImplementation(async (callback, result) => result),
}));

// Import after mocks
import { describe, it, expect } from "@jest/globals";
import { sendSamplingRequest } from "../sampling";
import { handleCallback } from "../../utils/message-handlers";
import type {
  CreateMessageRequest,
  CreateMessageResult,
} from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";

const mockHandleCallback = jest.mocked(handleCallback);

const mockResult: CreateMessageResult = {
  id: "test-id",
  content: {
    type: "text",
    text: "Test response",
  },
  role: "assistant",
  model: "test-model",
  metadata: {},
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateMessage.mockResolvedValue(mockResult);
});

describe("sendSamplingRequest", () => {
  const validRequest: CreateMessageRequest = {
    method: "sampling/createMessage",
    params: {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Hello world",
          },
        },
      ],
      maxTokens: 100,
    },
  };

  describe("Basic Request Validation", () => {
    it("should successfully process a valid request", async () => {
      const result = await sendSamplingRequest(validRequest);

      expect(mockCreateMessage).toHaveBeenCalledWith({
        messages: validRequest.params.messages,
        maxTokens: validRequest.params.maxTokens,
      });
      expect(result).toEqual(mockResult);
    });

    it("should throw error for missing method", async () => {
      const invalidRequest = {
        params: validRequest.params,
      };
      await expect(
        sendSamplingRequest(invalidRequest as any)
      ).rejects.toThrow();
    });

    it("should throw error for missing params", async () => {
      const invalidRequest = {
        method: "sampling/createMessage",
      };
      await expect(sendSamplingRequest(invalidRequest as any)).rejects.toThrow(
        "Request must have params"
      );
    });

    it("should throw error for empty messages array", async () => {
      const invalidRequest = {
        ...validRequest,
        params: {
          ...validRequest.params,
          messages: [],
        },
      };
      await expect(sendSamplingRequest(invalidRequest)).rejects.toThrow(
        "Request must have at least one message"
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
        "temperature must be a number between 0 and 1"
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
        'includeContext must be "none", "thisServer", or "allServers"'
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
        "Model preference priorities must be numbers between 0 and 1"
      );
    });
  });

  describe("Callback Handling", () => {
    it("should handle callback if provided", async () => {
      const mockCallbackResult: CreateMessageResult = {
        id: "callback-test-id",
        content: {
          type: "text",
          text: "Callback test response",
        },
        role: "assistant",
        model: "test-model",
        metadata: {},
      };
      mockCreateMessage.mockResolvedValue(mockCallbackResult);

      await sendSamplingRequest({
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
          _meta: {
            callback: "test-callback",
          },
        },
      });

      expect(mockHandleCallback).toHaveBeenCalledWith(
        "test-callback",
        mockCallbackResult
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle server error", async () => {
      const error = new Error("Server error");
      mockCreateMessage.mockRejectedValue(error);

      await expect(sendSamplingRequest(validRequest)).rejects.toThrow(error);
    });

    it("should format non-Error errors", async () => {
      const errorMessage = "Unknown server error";
      mockCreateMessage.mockRejectedValue(errorMessage);

      await expect(sendSamplingRequest(validRequest)).rejects.toThrow(
        `Failed to process sampling request: ${errorMessage}`
      );
    });
  });
});
