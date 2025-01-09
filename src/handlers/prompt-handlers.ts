import { SystemPromptService } from "../services/systemprompt-service.js";

const systemPromptService = new SystemPromptService();

export async function handleListPrompts() {
  return {
    prompts: [
      {
        name: "create_systemprompt_template",
        description: "Create a template for a systemprompt compatible prompt",
      },
    ],
  };
}

export async function handleGetPrompt(request: { params: { name: string } }) {
  if (request.params.name !== "create_systemprompt_template") {
    throw new Error("Unknown prompt");
  }

  return {
    messages: [
      {
        role: "system",
        content: {
          type: "text",
          text: "You are a helpful assistant that creates systemprompt compatible prompts.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: "Please provide a title and description for the prompt you want to create. The prompt should be clear, concise, and follow systemprompt.io best practices.",
        },
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'll help you create a systemprompt compatible prompt. Please provide:\n1. A clear title that describes the prompt's purpose\n2. A detailed description of what the prompt should accomplish",
        },
      },
    ],
  };
}
