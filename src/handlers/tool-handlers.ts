import type {
  ListToolsRequest,
  ListToolsResult,
  CallToolRequest,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import type { CreatePromptInput, EditPromptInput } from "../types/index.js";
import { SystemPromptService } from "../services/systemprompt-service.js";

let systemPromptService: SystemPromptService;

export function initializeService(apiKey: string) {
  systemPromptService = new SystemPromptService();
  systemPromptService.initialize(apiKey);
}

export async function handleListTools(
  request: ListToolsRequest
): Promise<ListToolsResult> {
  return {
    tools: [
      {
        name: "create_prompt",
        description: "Create a new prompt",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the prompt",
            },
            description: {
              type: "string",
              description: "Description of the prompt",
            },
            instruction: {
              type: "string",
              description: "The static instruction for the prompt",
            },
          },
          required: ["title", "description", "instruction"],
        },
      },
      {
        name: "edit_prompt",
        description: "Edit an existing prompt",
        inputSchema: {
          type: "object",
          properties: {
            uuid: {
              type: "string",
              description: "UUID of the prompt to edit",
            },
            title: {
              type: "string",
              description: "New title of the prompt",
            },
            description: {
              type: "string",
              description: "New description of the prompt",
            },
            instruction: {
              type: "string",
              description: "New static instruction for the prompt",
            },
          },
          required: ["uuid"],
        },
      },
    ],
  };
}

export async function handleToolCall(
  request: CallToolRequest
): Promise<CallToolResult> {
  const { name, arguments: args = {} } = request.params;

  switch (name) {
    case "create_prompt": {
      try {
        const promptArgs = args as {
          metadata: {
            title: string;
            description: string;
          };
          instruction: {
            static: string;
          };
          input: {
            name: string;
            description: string;
            type: string[];
            schema: any;
          };
          output: {
            name: string;
            description: string;
            type: string[];
            schema: any;
          };
        };

        const data: CreatePromptInput = {
          metadata: {
            title: promptArgs.metadata.title,
            description: promptArgs.metadata.description,
          },
          instruction: {
            static: promptArgs.instruction.static,
          },
          input: {
            name: promptArgs.input.name,
            description: promptArgs.input.description,
            type: promptArgs.input.type,
            schema: promptArgs.input.schema,
          },
          output: {
            name: promptArgs.output.name,
            description: promptArgs.output.description,
            type: promptArgs.output.type,
            schema: promptArgs.output.schema,
          },
        };

        const result = await systemPromptService.createPrompt(data);
        return {
          content: [
            {
              type: "text",
              text: `Created prompt: ${result.metadata.title}`,
            },
          ],
        };
      } catch (error: any) {
        throw new Error(`Failed to create prompt: ${error.message}`);
      }
    }

    case "edit_prompt": {
      try {
        const editArgs = args as {
          uuid: string;
          metadata?: {
            title?: string;
            description?: string;
          };
          instruction?: {
            static?: string;
          };
          input?: {
            name?: string;
            description?: string;
            type?: string[];
            schema?: any;
          };
          output?: {
            name?: string;
            description?: string;
            type?: string[];
            schema?: any;
          };
        };

        const data: EditPromptInput = {
          uuid: editArgs.uuid,
          metadata:
            editArgs.metadata?.title || editArgs.metadata?.description
              ? {
                  title: editArgs.metadata.title,
                  description: editArgs.metadata.description,
                }
              : undefined,
          instruction: editArgs.instruction
            ? {
                static: editArgs.instruction.static,
              }
            : undefined,
          input: editArgs.input
            ? {
                name: editArgs.input.name,
                description: editArgs.input.description,
                type: editArgs.input.type,
                schema: editArgs.input.schema,
              }
            : undefined,
          output: editArgs.output
            ? {
                name: editArgs.output.name,
                description: editArgs.output.description,
                type: editArgs.output.type,
                schema: editArgs.output.schema,
              }
            : undefined,
        };

        const result = await systemPromptService.editPrompt(
          editArgs.uuid,
          data
        );
        return {
          content: [
            {
              type: "text",
              text: `Updated prompt: ${result.metadata.title}`,
            },
          ],
        };
      } catch (error: any) {
        throw new Error(`Failed to edit prompt: ${error.message}`);
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
