import { CreateMessageResult } from "@modelcontextprotocol/sdk/types.js";
import { SystempromptAgentRequest, SystempromptBlockRequest, SystempromptPromptRequest } from "../types/systemprompt.js";
import { SystemPromptService } from "../services/systemprompt-service.js";
import { sendOperationNotification, sendPromptChangedNotification, sendResourceChangedNotification } from "./notifications.js";

/**
 * Handles creating a systemprompt prompt
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleCreatePromptCallback(
  result: CreateMessageResult
): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const promptRequest = JSON.parse(
    result.content.text
  ) as SystempromptPromptRequest;
  const request = {
    instruction: {
      static: promptRequest.instruction.static,
      state: "{{conversation.history}}",
      dynamic: "{{message}}",
    },
    input: {
      name: "DefaultInputSchema",
      description: "DefaultInputSchema Description",
      type: ["message"],
      schema: {
        type: "object",
        properties: {
          $schema: {
            type: "string",
            description: "The JSON Schema version",
            default: "http://json-schema.org/draft-07/schema#",
          },
          type: {
            type: "string",
            enum: ["object"],
          },
          properties: {
            name: {
              type: "string",
            },
          },
        },
        required: ["name"],
        additionalProperties: {
          type: "boolean",
        },
      },
    },
    output: {
      name: "DefaultOutputSchema",
      description: "DefaultOutputSchema Description",
      type: ["message"],
      schema: {
        type: "object",
        properties: {
          $schema: {
            type: "string",
            description: "The JSON Schema version",
            default: "http://json-schema.org/draft-07/schema#",
          },
          type: {
            type: "string",
            enum: ["object"],
          },
          properties: {
            name: {
              type: "string",
            },
          },
        },
        required: ["name"],
        additionalProperties: {
          type: "boolean",
        },
      },
    },
    metadata: {
      title: promptRequest.metadata.title,
      description: promptRequest.metadata.description,
      tag: promptRequest.metadata.tag,
      log_message: promptRequest.metadata.log_message,
    },
  };
  const service = SystemPromptService.getInstance();
  const prompt = await service.createPrompt(request);

  const message = `Successfully created ${prompt.metadata.title} with id: ${prompt.id}`;
  await sendOperationNotification("create_prompt", message);
  await sendPromptChangedNotification();
  return message;
}

/**
 * Handles editing a systemprompt prompt
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleEditPromptCallback(
  result: CreateMessageResult
): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const { uuid, ...updateData } = JSON.parse(
    result.content.text
  ) as SystempromptPromptRequest & { uuid: string };
  const service = SystemPromptService.getInstance();
  const prompt = await service.editPrompt(uuid, updateData);

  const message = `Successfully edited ${prompt.metadata.title} with id: ${prompt.id}`;
  await sendOperationNotification("edit_prompt", message);
  await sendPromptChangedNotification();
  return message;
}

/**
 * Handles creating a systemprompt block
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleCreateBlockCallback(
  result: CreateMessageResult
): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const blockRequest = JSON.parse(
    result.content.text
  ) as SystempromptBlockRequest;
  const service = SystemPromptService.getInstance();
  const block = await service.createBlock(blockRequest);

  const message = `Successfully created ${block.metadata.title} with id: ${block.id}`;
  await sendOperationNotification("create_block", message);
  await sendResourceChangedNotification();
  return message;
}

/**
 * Handles editing a systemprompt block
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleEditBlockCallback(
  result: CreateMessageResult
): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const { uuid, ...updateData } = JSON.parse(
    result.content.text
  ) as SystempromptBlockRequest & { uuid: string };
  const service = SystemPromptService.getInstance();
  const block = await service.editBlock(uuid, updateData);

  const message = `Successfully edited ${block.metadata.title} with id: ${block.id}`;
  await sendOperationNotification("edit_block", message);
  await sendResourceChangedNotification();
  return message;
}

/**
 * Handles creating a systemprompt agent
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleCreateAgentCallback(
  result: CreateMessageResult
): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const agentRequest = JSON.parse(
    result.content.text
  ) as SystempromptAgentRequest;
  const service = SystemPromptService.getInstance();
  const agent = await service.createAgent(agentRequest);

  const message = `Successfully created ${agent.metadata.title} with id: ${agent.id}`;
  await sendOperationNotification("create_agent", message);
  await sendResourceChangedNotification();
  return message;
}

/**
 * Handles editing a systemprompt agent
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleEditAgentCallback(
  result: CreateMessageResult
): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const { uuid, ...updateData } = JSON.parse(
    result.content.text
  ) as SystempromptAgentRequest & { uuid: string };
  const service = SystemPromptService.getInstance();
  const agent = await service.editAgent(uuid, updateData);

  const message = `Successfully edited ${agent.metadata.title} with id: ${agent.id}`;
  await sendOperationNotification("edit_agent", message);
  await sendResourceChangedNotification();
  return message;
}
