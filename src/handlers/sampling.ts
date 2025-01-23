import type {
  CreateMessageRequest,
  CreateMessageResult,
} from "@modelcontextprotocol/sdk/types.js";
import { validateRequest } from "../utils/validation.js";
import { server } from "../server.js";
import { handleCreatePromptCallback } from "./callbacks.js";
import {
  handleCreateAgentCallback,
  handleCreateBlockCallback,
  handleEditAgentCallback,
  handleEditBlockCallback,
  handleEditPromptCallback,
} from "./callbacks.js";

export async function sendSamplingRequest(
  request: CreateMessageRequest
): Promise<CreateMessageResult> {
  try {
    validateRequest(request);
    const result = await server.createMessage(request.params);

    const callback = request.params._meta?.callback;
    if (callback && typeof callback === "string") {
      await handleCallback(callback, result);
    }
    return result;
  } catch (error) {
    console.error(
      "Sampling request failed:",
      error instanceof Error ? error.message : error
    );
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Failed to process sampling request: ${error || "Unknown error"}`
    );
  }
}

/**
 * Handles a callback based on its type
 * @param callback The callback type
 * @param result The LLM result
 * @returns The tool response
 */
async function handleCallback(
  callback: string,
  result: CreateMessageResult
): Promise<string> {
  switch (callback) {
    case "create_prompt":
      return handleCreatePromptCallback(result);
    case "edit_prompt":
      return handleEditPromptCallback(result);
    case "create_block":
      return handleCreateBlockCallback(result);
    case "edit_block":
      return handleEditBlockCallback(result);
    case "create_agent":
      return handleCreateAgentCallback(result);
    case "edit_agent":
      return handleEditAgentCallback(result);
    default:
      return "Unknown callback type";
  }
}
