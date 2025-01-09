import { SystemPromptService } from "../services/systemprompt-service.js";
import { CreatePromptInput } from "../types/index.js";

const systemPromptService = new SystemPromptService();

export async function handleListTools() {
  return {
    tools: [
      {
        name: "create_systemprompt",
        description: "Create a new systemprompt compatible prompt",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the prompt",
            },
            description: {
              type: "string",
              description: "Description of what the prompt does",
            },
          },
          required: ["title", "description"],
        },
      },
    ],
  };
}

export async function handleToolCall(request: {
  params: { name: string; arguments?: any };
}) {
  switch (request.params.name) {
    case "create_systemprompt": {
      const { title, description } = request.params
        .arguments as CreatePromptInput;

      if (!title?.trim() || !description?.trim()) {
        throw new Error("Title and description are required");
      }

      const result = await systemPromptService.createPrompt({
        title: title.trim(),
        description: description.trim(),
      });

      return {
        content: [
          {
            type: "text",
            text: `Created systemprompt with ID: ${result.promptId}\nSystem Prompt: ${result.systemPrompt}`,
          },
        ],
      };
    }

    default:
      throw new Error("Unknown tool");
  }
}
