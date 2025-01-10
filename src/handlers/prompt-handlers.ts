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

export async function handleListPrompts(
  request: ListPromptsRequest
): Promise<ListPromptsResult> {
  try {
    const service = SystemPromptService.getInstance();
    const prompts = await service.getAllPrompts();
    return mapPromptsToListPromptsResult(prompts);
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
    const prompts = await service.getAllPrompts();
    const prompt = prompts.find(
      (p) => p.metadata.title === request.params.name
    );

    if (!prompt) {
      throw new Error(`Prompt not found: ${request.params.name}`);
    }

    return {
      _meta: { prompt },
      tools: [],
      ...mapPromptToGetPromptResult(prompt),
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
