import { SystemPromptService } from "../services/systemprompt-service.js";
import type {
  GetPromptResult,
  Prompt as MCPPrompt,
  ListPromptsRequest,
  ListPromptsResult,
  GetPromptRequest,
} from "@modelcontextprotocol/sdk/types.js";
import type { PromptCreationResult } from "../types/index.js";

let systemPromptService: SystemPromptService;

export function initializeService(apiKey: string) {
  systemPromptService = new SystemPromptService();
  systemPromptService.initialize(apiKey);
}

export async function handleListPrompts(
  request: ListPromptsRequest
): Promise<ListPromptsResult> {
  try {
    const prompts = await systemPromptService.getAllPrompt();
    return {
      prompts: prompts.map(convertToMCPPrompt),
    };
  } catch (error: any) {
    console.error("Failed to fetch prompts:", error);
    throw new Error("Failed to fetch prompts from systemprompt.io");
  }
}

export async function handleGetPrompt(
  request: GetPromptRequest
): Promise<GetPromptResult> {
  try {
    const prompts = await systemPromptService.getAllPrompt();
    const prompt = prompts.find(
      (p) => p.metadata.title === request.params.name
    );

    if (!prompt) {
      throw new Error(`Prompt not found: ${request.params.name}`);
    }

    return {
      name: prompt.metadata.title,
      description: prompt.metadata.description,
      messages: [
        {
          role: "assistant" as const,
          content: {
            type: "text" as const,
            text: prompt.instruction.static,
          },
        },
      ],
      _meta: {},
      tools: [],
    };
  } catch (error: any) {
    console.error("Failed to fetch prompt:", error);
    throw new Error(
      `Failed to fetch prompt from systemprompt.io: ${error.message}`
    );
  }
}

export function convertToMCPPrompt(prompt: PromptCreationResult): MCPPrompt {
  const promptArgs = Object.entries(prompt.input.schema.properties || {})
    .map(([name, schema]) => {
      if (typeof schema === "boolean") return null;
      if (typeof schema !== "object" || schema === null) return null;
      return {
        name,
        description:
          "description" in schema ? String(schema.description || "") : "",
        required: prompt.input.schema.required?.includes(name) || false,
      };
    })
    .filter((arg): arg is NonNullable<typeof arg> => arg !== null);

  return {
    name: prompt.metadata.title,
    description: prompt.metadata.description,
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: prompt.instruction.static,
        },
      },
    ],
    arguments: promptArgs,
  };
}
