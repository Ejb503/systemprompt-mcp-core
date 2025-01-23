// Mock setup
jest.mock("../../server", () => ({
  server: {
    notification: jest.fn(),
  },
}));

jest.mock("../../services/systemprompt-service");

import {
  handleCreatePromptCallback,
  handleEditPromptCallback,
  handleCreateBlockCallback,
  handleEditBlockCallback,
  handleCreateAgentCallback,
  handleEditAgentCallback,
} from "../callbacks";
import type { CreateMessageResult } from "@modelcontextprotocol/sdk/types.js";
import { SystemPromptService } from "../../services/systemprompt-service";
import type { SystempromptPromptResponse } from "../../types/systemprompt";

// Mock response data
const mockPromptResponse: SystempromptPromptResponse = {
  id: "test-id",
  metadata: {
    title: "Test",
    description: null,
    created: "2025-01-23T09:55:32.932Z",
    updated: "2025-01-23T09:55:32.932Z",
    version: 1,
    status: "active",
    author: "test",
    log_message: "test",
    tag: ["test"],
  },
  instruction: {
    static: "test",
    dynamic: "test",
    state: "test",
  },
  input: {
    name: "test",
    description: "test",
    type: ["text"],
    schema: {},
  },
  output: {
    name: "test",
    description: "test",
    type: ["text"],
    schema: {},
  },
  _link: "test",
};

// Mock the SystemPromptService class
const mockCreatePrompt = jest.fn().mockResolvedValue(mockPromptResponse);
const mockEditPrompt = jest.fn().mockResolvedValue(mockPromptResponse);
const mockCreateBlock = jest.fn().mockResolvedValue(mockPromptResponse);
const mockEditBlock = jest.fn().mockResolvedValue(mockPromptResponse);
const mockCreateAgent = jest.fn().mockResolvedValue(mockPromptResponse);
const mockEditAgent = jest.fn().mockResolvedValue(mockPromptResponse);

describe("callbacks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup SystemPromptService mock
    (SystemPromptService.getInstance as jest.Mock).mockReturnValue({
      createPrompt: mockCreatePrompt,
      editPrompt: mockEditPrompt,
      createBlock: mockCreateBlock,
      editBlock: mockEditBlock,
      createAgent: mockCreateAgent,
      editAgent: mockEditAgent,
      getAllPrompts: jest.fn().mockResolvedValue([]),
      listBlocks: jest.fn().mockResolvedValue([]),
    });
  });

  it("should handle create prompt callback", async () => {
    const response: CreateMessageResult = {
      content: {
        type: "text",
        text: JSON.stringify(mockPromptResponse),
      },
      role: "assistant",
      model: "test-model",
      _meta: {},
    };

    const result = await handleCreatePromptCallback(response);
    expect(mockCreatePrompt).toHaveBeenCalled();
    expect(response.content.type).toBe("text");
    if (response.content.type === "text") {
      expect(JSON.parse(response.content.text)).toEqual(mockPromptResponse);
    }
  });

  it("should handle edit prompt callback", async () => {
    const response: CreateMessageResult = {
      content: {
        type: "text",
        text: JSON.stringify(mockPromptResponse),
      },
      role: "assistant",
      model: "test-model",
      _meta: {},
    };

    const result = await handleEditPromptCallback(response);
    expect(mockEditPrompt).toHaveBeenCalled();
    expect(response.content.type).toBe("text");
    if (response.content.type === "text") {
      expect(JSON.parse(response.content.text)).toEqual(mockPromptResponse);
    }
  });

  it("should handle create block callback", async () => {
    const response: CreateMessageResult = {
      content: {
        type: "text",
        text: JSON.stringify(mockPromptResponse),
      },
      role: "assistant",
      model: "test-model",
      _meta: {},
    };

    const result = await handleCreateBlockCallback(response);
    expect(response.content.type).toBe("text");
    if (response.content.type === "text") {
      const responseData = JSON.parse(response.content.text);
      expect(responseData).toEqual(mockPromptResponse);
    }
    expect(mockCreateBlock).toHaveBeenCalled();
  });

  it("should handle edit block callback", async () => {
    const response: CreateMessageResult = {
      content: {
        type: "text",
        text: JSON.stringify(mockPromptResponse),
      },
      role: "assistant",
      model: "test-model",
      _meta: {},
    };

    const result = await handleEditBlockCallback(response);
    expect(response.content.type).toBe("text");
    if (response.content.type === "text") {
      const responseData = JSON.parse(response.content.text);
      expect(responseData).toEqual(mockPromptResponse);
    }
    expect(mockEditBlock).toHaveBeenCalled();
  });

  it("should handle create agent callback", async () => {
    const response: CreateMessageResult = {
      content: {
        type: "text",
        text: JSON.stringify(mockPromptResponse),
      },
      role: "assistant",
      model: "test-model",
      _meta: {},
    };

    const result = await handleCreateAgentCallback(response);
    expect(response.content.type).toBe("text");
    if (response.content.type === "text") {
      const responseData = JSON.parse(response.content.text);
      expect(responseData).toEqual(mockPromptResponse);
    }
    expect(mockCreateAgent).toHaveBeenCalled();
  });

  it("should handle edit agent callback", async () => {
    const response: CreateMessageResult = {
      content: {
        type: "text",
        text: JSON.stringify(mockPromptResponse),
      },
      role: "assistant",
      model: "test-model",
      _meta: {},
    };

    const result = await handleEditAgentCallback(response);
    expect(response.content.type).toBe("text");
    if (response.content.type === "text") {
      const responseData = JSON.parse(response.content.text);
      expect(responseData).toEqual(mockPromptResponse);
    }
    expect(mockEditAgent).toHaveBeenCalled();
  });

  it("should handle non-text content error", async () => {
    const result: CreateMessageResult = {
      content: {
        type: "image" as const,
        data: "base64data",
        mimeType: "image/jpeg",
      },
      role: "assistant" as const,
      model: "test-model",
      _meta: {},
    };

    await expect(handleCreatePromptCallback(result)).rejects.toThrow(
      "Expected text content"
    );
    await expect(handleEditPromptCallback(result)).rejects.toThrow(
      "Expected text content"
    );
    await expect(handleCreateBlockCallback(result)).rejects.toThrow(
      "Expected text content"
    );
    await expect(handleEditBlockCallback(result)).rejects.toThrow(
      "Expected text content"
    );
    await expect(handleCreateAgentCallback(result)).rejects.toThrow(
      "Expected text content"
    );
    await expect(handleEditAgentCallback(result)).rejects.toThrow(
      "Expected text content"
    );
  });
});
