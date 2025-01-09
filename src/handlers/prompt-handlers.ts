import { SystemPromptService } from "../services/systemprompt-service.js";
import { CreatePromptInput, PromptCreationResult } from "../types/index.js";

export async function handleListPrompts(
  service: SystemPromptService = new SystemPromptService()
) {
  const prompts = await service.getAllPrompts();

  return {
    prompts: prompts.map((prompt) => ({
      name: prompt.metadata.title,
      description: prompt.metadata.description,
      messages: [
        {
          role: "system",
          content: {
            type: "text",
            text: prompt.instruction.static,
          },
        },
      ],
      input_schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: prompt.input.description,
          },
        },
        required: [],
      },
      output_schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: prompt.output.description,
          },
        },
        required: [],
      },
    })),
  };
}

export async function handleGetPrompt(
  request: { params: { name: string } },
  service: SystemPromptService = new SystemPromptService()
) {
  const { name } = request.params;

  // Get the list of prompts
  const { prompts } = await handleListPrompts(service);

  // Find the requested prompt
  const prompt = prompts.find((p) => p.name === name);
  if (!prompt) {
    throw new Error("Unknown prompt");
  }

  return prompt;
}

export async function createPromptHandler(
  service: SystemPromptService,
  input: CreatePromptInput
): Promise<PromptCreationResult> {
  if (!input.instruction || !input.input || !input.output || !input.metadata) {
    throw new Error("Invalid input");
  }

  return service.createPrompt(input);
}

export async function editPromptHandler(
  service: SystemPromptService,
  uuid: string,
  input: Partial<CreatePromptInput>
): Promise<PromptCreationResult> {
  if (!uuid) {
    throw new Error("Invalid UUID");
  }

  return service.editPrompt(uuid, input);
}
