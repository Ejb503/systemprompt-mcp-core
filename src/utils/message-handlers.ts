import type {
  CreateMessageResult,
  PromptMessage,
} from "@modelcontextprotocol/sdk/types.js";
import { SystemPromptService } from "../services/systemprompt-service.js";
import type {
  SystempromptPromptRequest,
  SystempromptBlockRequest,
  SystempromptAgentRequest,
} from "../types/systemprompt.js";
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

/**
 * Handles creating a systemprompt prompt
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleCreatePromptCallback(
  result: CreateMessageResult
): Promise<CreateMessageResult> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const promptRequest = JSON.parse(
    result.content.text
  ) as SystempromptPromptRequest;
  const service = SystemPromptService.getInstance();
  const prompt = await service.createPrompt(promptRequest);

  return {
    role: "assistant",
    model: result.model,
    content: {
      type: "text",
      text: JSON.stringify(prompt, null, 2),
    },
  };
}

/**
 * Handles editing a systemprompt prompt
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleEditPromptCallback(
  result: CreateMessageResult
): Promise<CreateMessageResult> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const { uuid, ...updateData } = JSON.parse(
    result.content.text
  ) as SystempromptPromptRequest & { uuid: string };
  const service = SystemPromptService.getInstance();
  const prompt = await service.editPrompt(uuid, updateData);

  return {
    role: "assistant",
    model: result.model,
    content: {
      type: "text",
      text: JSON.stringify(prompt, null, 2),
    },
  };
}

/**
 * Handles creating a systemprompt block
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleCreateBlockCallback(
  result: CreateMessageResult
): Promise<CreateMessageResult> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const blockRequest = JSON.parse(
    result.content.text
  ) as SystempromptBlockRequest;
  const service = SystemPromptService.getInstance();
  const block = await service.createBlock(blockRequest);

  return {
    role: "assistant",
    model: result.model,
    content: {
      type: "text",
      text: JSON.stringify(block, null, 2),
    },
  };
}

/**
 * Handles editing a systemprompt block
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleEditBlockCallback(
  result: CreateMessageResult
): Promise<CreateMessageResult> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const { uuid, ...updateData } = JSON.parse(
    result.content.text
  ) as SystempromptBlockRequest & { uuid: string };
  const service = SystemPromptService.getInstance();
  const block = await service.editBlock(uuid, updateData);

  return {
    role: "assistant",
    model: result.model,
    content: {
      type: "text",
      text: JSON.stringify(block, null, 2),
    },
  };
}

/**
 * Handles creating a systemprompt agent
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleCreateAgentCallback(
  result: CreateMessageResult
): Promise<CreateMessageResult> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const agentRequest = JSON.parse(
    result.content.text
  ) as SystempromptAgentRequest;
  const service = SystemPromptService.getInstance();
  const agent = await service.createAgent(agentRequest);

  return {
    role: "assistant",
    model: result.model,
    content: {
      type: "text",
      text: JSON.stringify(agent, null, 2),
    },
  };
}

/**
 * Handles editing a systemprompt agent
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleEditAgentCallback(
  result: CreateMessageResult
): Promise<CreateMessageResult> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const { uuid, ...updateData } = JSON.parse(
    result.content.text
  ) as SystempromptAgentRequest & { uuid: string };
  const service = SystemPromptService.getInstance();
  const agent = await service.editAgent(uuid, updateData);

  return {
    role: "assistant",
    model: result.model,
    content: {
      type: "text",
      text: JSON.stringify(agent, null, 2),
    },
  };
}

/**
 * Handles a callback based on its type
 * @param callback The callback type
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleCallback(
  callback: string,
  result: CreateMessageResult
): Promise<CreateMessageResult> {
  switch (callback) {
    case "systemprompt_create_prompt":
      return handleCreatePromptCallback(result);
    case "systemprompt_edit_prompt":
      return handleEditPromptCallback(result);
    case "systemprompt_create_block":
      return handleCreateBlockCallback(result);
    case "systemprompt_edit_block":
      return handleEditBlockCallback(result);
    case "systemprompt_create_agent":
      return handleCreateAgentCallback(result);
    case "systemprompt_edit_agent":
      return handleEditAgentCallback(result);
    default:
      console.warn(`Unknown callback type: ${callback}`);
      return result;
  }
}
