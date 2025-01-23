import type { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import { XML_TAGS } from "../constants/message-handler.js";

/**
 * Updates a user message with existing page content
 * @param messages Array of messages to update
 * @param blocks The page blocks to include
 */
export function updateUserMessageWithContent(
  messages: PromptMessage[],
  blocks: unknown
): void {
  const userMessageIndex = messages.findIndex((msg) => msg.role === "user");
  if (userMessageIndex === -1) return;

  const userMessage = messages[userMessageIndex];
  if (userMessage.content.type !== "text") return;

  messages[userMessageIndex] = {
    role: "user",
    content: {
      type: "text",
      text: userMessage.content.text.replace(
        XML_TAGS.REQUEST_PARAMS_CLOSE,
        XML_TAGS.EXISTING_CONTENT_TEMPLATE(JSON.stringify(blocks, null, 2))
      ),
    },
  };
}

/**
 * Injects variables into text
 * @param text The text to inject variables into
 * @param variables The variables to inject
 * @returns The text with variables injected
 */
export function injectVariablesIntoText(
  text: string,
  variables: Record<string, unknown>
): string {
  const matches = text.match(/{{([^}]+)}}/g);
  if (!matches) return text;

  const missingVariables = matches
    .map((match) => match.slice(2, -2))
    .filter((key) => !(key in variables));

  if (missingVariables.length > 0) {
    throw new Error(
      "Missing required variables: " + missingVariables.join(", ")
    );
  }

  return text.replace(/{{([^}]+)}}/g, (_, key) => String(variables[key]));
}

/**
 * Injects variables into a message
 * @param message The message to inject variables into
 * @param variables The variables to inject
 * @returns The message with variables injected
 */
export function injectVariables(
  message: PromptMessage,
  variables: Record<string, unknown>
): PromptMessage {
  if (message.content.type !== "text") return message;

  return {
    ...message,
    content: {
      type: "text",
      text: injectVariablesIntoText(message.content.text, variables),
    },
  };
}
