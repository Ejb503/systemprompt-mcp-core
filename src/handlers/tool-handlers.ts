import { SystemPromptService } from "../services/systemprompt-service.js";
import {
  CreatePromptInput,
  CreateBlockInput,
  EditPromptInput,
  EditBlockInput,
  Tool,
} from "../types/index.js";

const systemPromptService = new SystemPromptService();

export function handleListTools(): { tools: Tool[] } {
  return {
    tools: [
      {
        name: "create_prompt",
        description:
          "Create a new prompt with customizable instruction components, input/output schemas, and metadata. The instruction can contain static content (always included), state content (persisted between calls), and dynamic content (provided at runtime). Input and output schemas define the expected format and type of data. Use this to create reusable prompt templates that can be executed later.",
        inputSchema: {
          type: "object",
          properties: {
            instruction: {
              type: "object",
              properties: {
                static: {
                  type: "string",
                  description:
                    "The core instruction content that remains consistent between uses. This forms the base of your prompt template and should contain the main instructions, context, and any fixed constraints.",
                },
                state: {
                  type: "string",
                  description:
                    "Content that persists between different calls to the LLM, typically containing conversation history or context from previous interactions. Use {{variable}} syntax for dynamic state references.",
                },
                dynamic: {
                  type: "string",
                  description:
                    "Content provided at runtime that changes with each execution. This usually contains the user's input or any variable content. Use {{variable}} syntax for dynamic content placeholders.",
                },
              },
              required: ["static"],
            },
            input: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description:
                    "Unique identifier for the input schema, using only letters and underscores",
                },
                description: {
                  type: "string",
                  description:
                    "Detailed description of what input this prompt expects and how it should be formatted",
                },
                type: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["message", "structured_data", "artifact"],
                  },
                  description:
                    "Array of accepted input types: 'message' for text, 'structured_data' for JSON, 'artifact' for files/binary data",
                },
              },
              required: ["name", "description", "type"],
            },
            output: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description:
                    "Unique identifier for the output schema, using only letters and underscores",
                },
                description: {
                  type: "string",
                  description:
                    "Detailed description of what output this prompt will generate and in what format",
                },
                type: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["message", "structured_data", "artifact"],
                  },
                  description:
                    "Array of possible output types: 'message' for text, 'structured_data' for JSON, 'artifact' for files/binary data",
                },
              },
              required: ["name", "description", "type"],
            },
            metadata: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description:
                    "Short, descriptive title for the prompt template",
                },
                description: {
                  type: "string",
                  description:
                    "Detailed description of what this prompt does and how it should be used",
                },
                tag: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Array of tags for categorizing and searching prompts",
                },
              },
              required: ["title", "description"],
            },
          },
          required: ["instruction", "input", "output", "metadata"],
        },
      },
      {
        name: "edit_prompt",
        description:
          "Modify an existing prompt template by its UUID. You can update any combination of the instruction components, input/output schemas, or metadata. Only the specified fields will be updated, leaving others unchanged. This is useful for iterating on prompt designs or fixing issues in existing prompts.",
        inputSchema: {
          type: "object",
          properties: {
            uuid: {
              type: "string",
              description: "UUID of the prompt template to edit",
            },
            instruction: {
              type: "object",
              properties: {
                static: {
                  type: "string",
                  description: "Updated core instruction content",
                },
                state: {
                  type: "string",
                  description: "Updated state management content",
                },
                dynamic: {
                  type: "string",
                  description: "Updated dynamic content template",
                },
              },
            },
            input: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Updated name for the input schema",
                },
                description: {
                  type: "string",
                  description: "Updated input description",
                },
                type: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["message", "structured_data", "artifact"],
                  },
                  description: "Updated array of accepted input types",
                },
              },
            },
            output: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Updated name for the output schema",
                },
                description: {
                  type: "string",
                  description: "Updated output description",
                },
                type: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["message", "structured_data", "artifact"],
                  },
                  description: "Updated array of possible output types",
                },
              },
            },
            metadata: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Updated title for the prompt",
                },
                description: {
                  type: "string",
                  description: "Updated prompt description",
                },
                tag: {
                  type: "array",
                  items: { type: "string" },
                  description: "Updated tags for the prompt",
                },
              },
            },
          },
          required: ["uuid"],
        },
      },
      {
        name: "create_block",
        description:
          "Create a new block (resource) that can be referenced by prompts. Blocks are reusable content snippets that can be included in multiple prompts, such as common instructions, context, or constraints. Each block has a unique prefix for easy referencing in prompts using the {{prefix}} syntax.",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description:
                "The actual content of the block that will be inserted into prompts when referenced",
            },
            prefix: {
              type: "string",
              description:
                "Unique identifier prefix for referencing this block in prompts using {{prefix}} syntax. Must contain only letters and underscores.",
              pattern: "^[a-zA-Z_]+$",
            },
            metadata: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Short, descriptive title for the block",
                },
                description: {
                  type: "string",
                  description:
                    "Detailed description of what this block contains and how it should be used",
                },
                tag: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Array of tags for categorizing and searching blocks",
                },
              },
              required: ["title", "description"],
            },
          },
          required: ["content", "metadata"],
        },
      },
      {
        name: "edit_block",
        description:
          "Modify an existing block (resource) by its UUID. You can update the content, prefix, or metadata of the block. Only the specified fields will be updated, leaving others unchanged. This is useful for maintaining and improving shared prompt components.",
        inputSchema: {
          type: "object",
          properties: {
            uuid: {
              type: "string",
              description: "UUID of the block to edit",
            },
            content: {
              type: "string",
              description: "Updated content for the block",
            },
            prefix: {
              type: "string",
              description:
                "Updated prefix for referencing this block. Must contain only letters and underscores.",
              pattern: "^[a-zA-Z_]+$",
            },
            metadata: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Updated title for the block",
                },
                description: {
                  type: "string",
                  description: "Updated block description",
                },
                tag: {
                  type: "array",
                  items: { type: "string" },
                  description: "Updated tags for the block",
                },
              },
            },
          },
          required: ["uuid"],
        },
      },
    ],
  };
}

export async function handleToolCall(request: {
  params: { name: string; arguments?: any };
}) {
  switch (request.params.name) {
    case "create_prompt": {
      const promptData = request.params.arguments as CreatePromptInput;
      const result = await systemPromptService.createPrompt(promptData);
      return {
        content: [
          {
            type: "text",
            text: `Created prompt with ID: ${result.id}`,
          },
        ],
        _meta: {
          prompt: result,
        },
      };
    }

    case "edit_prompt": {
      const { uuid, ...promptData } = request.params
        .arguments as EditPromptInput;
      const result = await systemPromptService.editPrompt(uuid, promptData);
      return {
        content: [
          {
            type: "text",
            text: `Updated prompt with ID: ${result.id}`,
          },
        ],
        _meta: {
          prompt: result,
        },
      };
    }

    case "create_block": {
      const blockData = request.params.arguments as CreateBlockInput;
      const result = await systemPromptService.createBlock(blockData);
      return {
        content: [
          {
            type: "text",
            text: `Created block with ID: ${result.id}`,
          },
        ],
        _meta: {
          block: result,
        },
      };
    }

    case "edit_block": {
      const { uuid, ...blockData } = request.params.arguments as EditBlockInput;
      const result = await systemPromptService.editBlock(uuid, blockData);
      return {
        content: [
          {
            type: "text",
            text: `Updated block with ID: ${result.id}`,
          },
        ],
        _meta: {
          block: result,
        },
      };
    }

    default:
      throw new Error("Unknown tool");
  }
}
