import {
  PromptListChangedNotification,
  ResourceListChangedNotification,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types.js";
import { SystemPromptService } from "../services/systemprompt-service.js";
import {
  mapPromptsToListPromptsResult,
  mapBlocksToListResourcesResult,
} from "../utils/mcp-mappers.js";
import { server } from "../server.js";

export async function sendPromptChangedNotification(): Promise<void> {
  const service = SystemPromptService.getInstance();
  const prompts = await service.getAllPrompts();
  const notification: PromptListChangedNotification = {
    method: "notifications/prompts/list_changed",
    params: mapPromptsToListPromptsResult(prompts),
  };
  await sendNotification(notification);
}

export async function sendResourceChangedNotification(): Promise<void> {
  const service = SystemPromptService.getInstance();
  const blocks = await service.listBlocks();
  const notification: ResourceListChangedNotification = {
    method: "notifications/resources/list_changed",
    params: mapBlocksToListResourcesResult(blocks),
  };
  await sendNotification(notification);
}

export async function sendOperationNotification(
  operation: string,
  message: string
): Promise<void> {
  const notification: ServerNotification = {
    method: "notifications/message",
    params: {
      _meta: {},
      message: `Operation ${operation}: ${message}`,
      level: "info",
      timestamp: new Date().toISOString(),
    },
  };
  await sendNotification(notification);
}

async function sendNotification(notification: ServerNotification) {
  await server.notification(notification);
}
