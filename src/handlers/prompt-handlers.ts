import {
  GetPromptRequest,
  GetPromptResult,
  ListPromptsRequest,
  ListPromptsResult,
} from "@modelcontextprotocol/sdk/types.js";
import { SystemPromptService } from "../services/systemprompt-service.js";
import {
  mapPromptToGetPromptResult,
  mapPromptsToListPromptsResult,
} from "../utils/mcp-mappers.js";
import { PROMPTS } from "../constants/sampling-prompts.js";

export async function handleListPrompts(
  request: ListPromptsRequest
): Promise<ListPromptsResult> {
  try {
    const service = SystemPromptService.getInstance();
    const remotePrompts = await service.getAllPrompts();
    const allPrompts = mapPromptsToListPromptsResult(remotePrompts);
    allPrompts.prompts = allPrompts.prompts.concat(PROMPTS);

    return allPrompts;
  } catch (error: any) {
    console.error("Failed to fetch prompts:", error);
    throw new Error("Failed to fetch prompts from systemprompt.io");
  }
}

export async function handleGetPrompt(
  request: GetPromptRequest
): Promise<GetPromptResult> {
  try {
    const service = SystemPromptService.getInstance();
    const remotePrompts = await service.getAllPrompts();
    const mappedRemotePrompts = remotePrompts.map((i) =>
      mapPromptToGetPromptResult(i)
    );

    const allPrompts = [...mappedRemotePrompts, ...PROMPTS];
    const prompt = allPrompts.find((p) => p.name === request.params.name);

    if (!prompt) {
      throw new Error(`Prompt not found: ${request.params.name}`);
    }

    return {
      _meta: { prompt },
      ...prompt,
    };
  } catch (error: any) {
    console.error("Failed to fetch prompt:", error);
    throw new Error(
      `Failed to fetch prompt from systemprompt.io: ${
        error.message || "Unknown error"
      }`
    );
  }
}
