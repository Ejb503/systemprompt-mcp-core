import {
  updateUserMessageWithContent,
  injectVariablesIntoText,
  injectVariables,
  handleCreatePromptCallback,
  handleEditPromptCallback,
  handleCreateBlockCallback,
  handleEditBlockCallback,
  handleCreateAgentCallback,
  handleEditAgentCallback,
  handleCallback,
} from "../message-handlers";
import { XML_TAGS } from "../../constants/message-handler";
import type {
  PromptMessage,
  CreateMessageResult,
} from "@modelcontextprotocol/sdk/types.js";
import { SystemPromptService } from "../../services/systemprompt-service";
import type {
  SystempromptPromptResponse,
  SystempromptPromptRequest,
  Metadata,
} from "../../types/systemprompt";

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

jest.mock("../../services/systemprompt-service", () => ({
  SystemPromptService: {
    getInstance: jest.fn(() => ({
      createPrompt: mockCreatePrompt,
      editPrompt: mockEditPrompt,
      createBlock: mockCreateBlock,
      editBlock: mockEditBlock,
      createAgent: mockCreateAgent,
      editAgent: mockEditAgent,
    })),
  },
}));

describe("message-handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("updateUserMessageWithContent", () => {
    it("should update user message with content", () => {
      const messages: PromptMessage[] = [
        {
          role: "user",
          content: {
            type: "text",
            text: `test message${XML_TAGS.REQUEST_PARAMS_CLOSE}`,
          },
        },
      ];
      const blocks = { test: "data" };

      updateUserMessageWithContent(messages, blocks);

      expect(messages[0].content.type).toBe("text");
      expect(messages[0].content.text).toContain(
        JSON.stringify(blocks, null, 2)
      );
    });

    it("should not modify messages if no user message exists", () => {
      const messages: PromptMessage[] = [
        { role: "assistant", content: { type: "text", text: "test" } },
      ];
      const originalMessages = [...messages];

      updateUserMessageWithContent(messages, {});

      expect(messages).toEqual(originalMessages);
    });
  });

  describe("injectVariablesIntoText", () => {
    it("should inject variables into text", () => {
      const text = "Hello {{name}}, your age is {{age}}";
      const variables = { name: "John", age: 30 };

      const result = injectVariablesIntoText(text, variables);

      expect(result).toBe("Hello John, your age is 30");
    });

    it("should handle missing variables", () => {
      const text = "Hello {{name}}";
      const variables = { name: "John" };

      const result = injectVariablesIntoText(text, variables);

      expect(result).toBe("Hello John");
    });

    it("should throw error for missing required variables", () => {
      const text = "Hello {{name}}, your age is {{age}}";
      const variables = { name: "John" };

      expect(() => injectVariablesIntoText(text, variables)).toThrow(
        "Missing required variables: age"
      );
    });
  });

  describe("injectVariables", () => {
    it("should inject variables into text message", () => {
      const message: PromptMessage = {
        role: "user",
        content: { type: "text", text: "Hello {{name}}" },
      };
      const variables = { name: "John" };

      const result = injectVariables(message, variables);

      expect(result.content.type).toBe("text");
      expect(result.content.text).toBe("Hello John");
    });
  });

  describe("callback handlers", () => {
    it("should handle create prompt callback", async () => {
      const result: CreateMessageResult = {
        content: {
          type: "text" as const,
          text: JSON.stringify({
            metadata: {
              title: "Test Prompt",
              description: "A test prompt",
              version: 1,
              status: "active",
              author: "test",
              log_message: "test",
            },
            instruction: {
              static: "Test instruction",
            },
            input: {
              type: ["text"],
            },
            output: {
              type: ["text"],
            },
          }),
        },
        role: "assistant" as const,
        model: "test-model",
        _meta: {},
      };

      const response = await handleCreatePromptCallback(result);
      expect(response.content.type).toBe("text");
      if (response.content.type === "text") {
        const responseData = JSON.parse(
          response.content.text
        ) as SystempromptPromptResponse;
        expect(responseData).toMatchObject({
          id: "test-id",
          metadata: expect.any(Object),
          instruction: expect.any(Object),
          input: expect.any(Object),
          output: expect.any(Object),
        });
      }
      expect(mockCreatePrompt).toHaveBeenCalled();
    });

    it("should handle edit prompt callback", async () => {
      const result: CreateMessageResult = {
        content: {
          type: "text" as const,
          text: JSON.stringify({
            uuid: "test-id",
            metadata: {
              title: "Test Prompt",
              description: "A test prompt",
              version: 1,
              status: "active",
              author: "test",
              log_message: "test",
            },
            instruction: {
              static: "Test instruction",
            },
            input: {
              type: ["text"],
            },
            output: {
              type: ["text"],
            },
          }),
        },
        role: "assistant" as const,
        model: "test-model",
        _meta: {},
      };

      const response = await handleEditPromptCallback(result);
      expect(response.content.type).toBe("text");
      if (response.content.type === "text") {
        const responseData = JSON.parse(
          response.content.text
        ) as SystempromptPromptResponse;
        expect(responseData).toMatchObject({
          id: "test-id",
          metadata: expect.any(Object),
          instruction: expect.any(Object),
          input: expect.any(Object),
          output: expect.any(Object),
        });
      }
      expect(mockEditPrompt).toHaveBeenCalled();
    });

    it("should handle callback routing", async () => {
      const result: CreateMessageResult = {
        content: {
          type: "text" as const,
          text: JSON.stringify({
            metadata: {
              title: "Test Prompt",
              description: "A test prompt",
              version: 1,
              status: "active",
              author: "test",
              log_message: "test",
            },
            instruction: {
              static: "Test instruction",
            },
            input: {
              type: ["text"],
            },
            output: {
              type: ["text"],
            },
          }),
        },
        role: "assistant" as const,
        model: "test-model",
        _meta: {},
      };

      const createResponse = await handleCallback(
        "systemprompt_create_prompt",
        result
      );
      expect(mockCreatePrompt).toHaveBeenCalled();
      if (createResponse.content.type === "text") {
        const createData = JSON.parse(
          createResponse.content.text
        ) as SystempromptPromptResponse;
        expect(createData).toMatchObject({
          id: "test-id",
        });
      }

      const editResponse = await handleCallback(
        "systemprompt_edit_prompt",
        result
      );
      expect(mockEditPrompt).toHaveBeenCalled();
      if (editResponse.content.type === "text") {
        const editData = JSON.parse(
          editResponse.content.text
        ) as SystempromptPromptResponse;
        expect(editData).toMatchObject({
          id: "test-id",
        });
      }

      // Unknown callback should return original result
      const response = await handleCallback("unknown", result);
      expect(response).toBe(result);
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

    it("should handle create block callback", async () => {
      const result: CreateMessageResult = {
        content: {
          type: "text" as const,
          text: JSON.stringify({
            metadata: {
              title: "Test Block",
              description: "A test block",
              version: 1,
              status: "active",
              author: "test",
              log_message: "test",
            },
            content: "Test block content",
          }),
        },
        role: "assistant" as const,
        model: "test-model",
        _meta: {},
      };

      const response = await handleCreateBlockCallback(result);
      expect(response.content.type).toBe("text");
      if (response.content.type === "text") {
        const responseData = JSON.parse(response.content.text);
        expect(responseData).toMatchObject({
          id: "test-id",
          metadata: expect.any(Object),
        });
      }
      expect(mockCreateBlock).toHaveBeenCalled();
    });

    it("should handle edit block callback", async () => {
      const result: CreateMessageResult = {
        content: {
          type: "text" as const,
          text: JSON.stringify({
            uuid: "test-id",
            metadata: {
              title: "Test Block",
              description: "A test block",
              version: 1,
              status: "active",
              author: "test",
              log_message: "test",
            },
            content: "Updated block content",
          }),
        },
        role: "assistant" as const,
        model: "test-model",
        _meta: {},
      };

      const response = await handleEditBlockCallback(result);
      expect(response.content.type).toBe("text");
      if (response.content.type === "text") {
        const responseData = JSON.parse(response.content.text);
        expect(responseData).toMatchObject({
          id: "test-id",
          metadata: expect.any(Object),
        });
      }
      expect(mockEditBlock).toHaveBeenCalled();
    });

    it("should handle create agent callback", async () => {
      const result: CreateMessageResult = {
        content: {
          type: "text" as const,
          text: JSON.stringify({
            metadata: {
              title: "Test Agent",
              description: "A test agent",
              version: 1,
              status: "active",
              author: "test",
              log_message: "test",
            },
            instruction: "Test agent instruction",
          }),
        },
        role: "assistant" as const,
        model: "test-model",
        _meta: {},
      };

      const response = await handleCreateAgentCallback(result);
      expect(response.content.type).toBe("text");
      if (response.content.type === "text") {
        const responseData = JSON.parse(response.content.text);
        expect(responseData).toMatchObject({
          id: "test-id",
          metadata: expect.any(Object),
        });
      }
      expect(mockCreateAgent).toHaveBeenCalled();
    });

    it("should handle edit agent callback", async () => {
      const result: CreateMessageResult = {
        content: {
          type: "text" as const,
          text: JSON.stringify({
            uuid: "test-id",
            metadata: {
              title: "Test Agent",
              description: "A test agent",
              version: 1,
              status: "active",
              author: "test",
              log_message: "test",
            },
            instruction: "Updated agent instruction",
          }),
        },
        role: "assistant" as const,
        model: "test-model",
        _meta: {},
      };

      const response = await handleEditAgentCallback(result);
      expect(response.content.type).toBe("text");
      if (response.content.type === "text") {
        const responseData = JSON.parse(response.content.text);
        expect(responseData).toMatchObject({
          id: "test-id",
          metadata: expect.any(Object),
        });
      }
      expect(mockEditAgent).toHaveBeenCalled();
    });

    it("should handle callback routing for all types", async () => {
      const result: CreateMessageResult = {
        content: {
          type: "text" as const,
          text: JSON.stringify({
            metadata: {
              title: "Test Prompt",
              description: "A test prompt",
              version: 1,
              status: "active",
              author: "test",
              log_message: "test",
            },
            instruction: {
              static: "Test instruction",
            },
            input: {
              type: ["text"],
            },
            output: {
              type: ["text"],
            },
          }),
        },
        role: "assistant" as const,
        model: "test-model",
        _meta: {},
      };

      const createResponse = await handleCallback(
        "systemprompt_create_prompt",
        result
      );
      expect(mockCreatePrompt).toHaveBeenCalled();
      if (createResponse.content.type === "text") {
        const createData = JSON.parse(
          createResponse.content.text
        ) as SystempromptPromptResponse;
        expect(createData).toMatchObject({
          id: "test-id",
        });
      }

      const editResponse = await handleCallback(
        "systemprompt_edit_prompt",
        result
      );
      expect(mockEditPrompt).toHaveBeenCalled();
      if (editResponse.content.type === "text") {
        const editData = JSON.parse(
          editResponse.content.text
        ) as SystempromptPromptResponse;
        expect(editData).toMatchObject({
          id: "test-id",
        });
      }

      const blockResult = await handleCallback(
        "systemprompt_create_block",
        result
      );
      expect(mockCreateBlock).toHaveBeenCalled();
      if (blockResult.content.type === "text") {
        const blockData = JSON.parse(blockResult.content.text);
        expect(blockData).toMatchObject({
          id: "test-id",
        });
      }

      const editBlockResult = await handleCallback(
        "systemprompt_edit_block",
        result
      );
      expect(mockEditBlock).toHaveBeenCalled();
      if (editBlockResult.content.type === "text") {
        const editBlockData = JSON.parse(editBlockResult.content.text);
        expect(editBlockData).toMatchObject({
          id: "test-id",
        });
      }

      const agentResult = await handleCallback(
        "systemprompt_create_agent",
        result
      );
      expect(mockCreateAgent).toHaveBeenCalled();
      if (agentResult.content.type === "text") {
        const agentData = JSON.parse(agentResult.content.text);
        expect(agentData).toMatchObject({
          id: "test-id",
        });
      }

      const editAgentResult = await handleCallback(
        "systemprompt_edit_agent",
        result
      );
      expect(mockEditAgent).toHaveBeenCalled();
      if (editAgentResult.content.type === "text") {
        const editAgentData = JSON.parse(editAgentResult.content.text);
        expect(editAgentData).toMatchObject({
          id: "test-id",
        });
      }

      // Unknown callback should return original result
      const response = await handleCallback("unknown", result);
      expect(response).toBe(result);
    });
  });
});
