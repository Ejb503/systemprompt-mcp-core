import { PromptService } from "../services/prompt-service.js";
import type { CreatePromptInput, PromptCreationResult, EditPromptInput } from "../types/index.js";
import { ServiceError } from "../utils/error-handling.js";

export async function handleListPrompts(service: PromptService) {
  const prompts = await service.getAllPrompts();
  return {
    prompts: prompts.map((prompt: PromptCreationResult) => ({
      name: prompt.metadata.title,
      description: prompt.metadata.description,
      messages: [
        {
          role: "system",
          content: {
            type: "text",
            text: prompt.instruction.static
          }
        }
      ],
      input_schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: prompt.input.description
          }
        },
        required: []
      },
      output_schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: prompt.output.description
          }
        },
        required: []
      }
    }))
  };
}

export async function handleGetPrompt(request: { params: { name: string } }, service: PromptService) {
  const { name } = request.params;
  const prompts = await service.getAllPrompts();
  const prompt = prompts.find((p: PromptCreationResult) => p.metadata.title === name);

  if (!prompt) {
    throw new ServiceError("Prompt not found", "fetch prompt", new Error(`No prompt found with name: ${name}`));
  }

  return {
    name: prompt.metadata.title,
    description: prompt.metadata.description,
    messages: [
      {
        role: "system",
        content: {
          type: "text",
          text: prompt.instruction.static
        }
      }
    ],
    input_schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: prompt.input.description
        }
      },
      required: []
    },
    output_schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: prompt.output.description
        }
      },
      required: []
    }
  };
}

export async function createPromptHandler(service: PromptService, input: CreatePromptInput) {
  if (!input.instruction) {
    throw new ServiceError("Missing required field: instruction", "create prompt", new Error("Invalid input: instruction field is required"));
  }

  return await service.createPrompt(input);
}

export async function editPromptHandler(service: PromptService, promptId: string, input: Partial<CreatePromptInput>) {
  if (!promptId) {
    throw new ServiceError("Missing required field: promptId", "edit prompt", new Error("Invalid UUID: promptId is required"));
  }

  const editInput: EditPromptInput = {
    uuid: promptId,
    ...input
  };

  return await service.editPrompt(promptId, editInput);
}
