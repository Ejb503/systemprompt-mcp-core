import {
  PromptListChangedNotification,
  ResourceListChangedNotification,
} from "@modelcontextprotocol/sdk/types.js";
import { SystemPromptService } from "../services/systemprompt-service.js";
import {
  mapPromptsToListPromptsResult,
  mapBlocksToListResourcesResult,
} from "../utils/mcp-mappers.js";

export async function sendPromptChangedNotification(): Promise<PromptListChangedNotification> {
  const service = SystemPromptService.getInstance();
  const prompts = await service.getAllPrompts();
  return {
    method: "notifications/prompts/list_changed",
    params: mapPromptsToListPromptsResult(prompts),
  };
}

export async function sendResourceChangedNotification(): Promise<ResourceListChangedNotification> {
  const service = SystemPromptService.getInstance();
  const blocks = await service.listBlocks();
  return {
    method: "notifications/resources/list_changed",
    params: mapBlocksToListResourcesResult(blocks),
  };
}
