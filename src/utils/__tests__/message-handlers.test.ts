// Mock setup
jest.mock("../../server", () => ({
  server: {
    notification: jest.fn(),
  },
}));

import {
  updateUserMessageWithContent,
  injectVariablesIntoText,
  injectVariables,
} from "../message-handlers";
import { XML_TAGS } from "../../constants/message-handler";
import type { PromptMessage } from "@modelcontextprotocol/sdk/types.js";

describe("message-handlers", () => {
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

    it("should return original message for non-text content", () => {
      const message: PromptMessage = {
        role: "user",
        content: {
          type: "image",
          data: "base64data",
          mimeType: "image/jpeg",
        },
      };
      const variables = { name: "John" };

      const result = injectVariables(message, variables);
      expect(result).toEqual(message);
    });
  });
});
