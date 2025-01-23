import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type {
  CreateMessageRequest,
  CreateMessageResult,
} from "@modelcontextprotocol/sdk/types.js";
import { validateRequest } from "../utils/validation.js";
import { handleCallback } from "../utils/message-handlers.js";
import { server } from "../server.js";

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
