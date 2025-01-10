import { SystemPromptService } from "../services/systemprompt-service.js";
import {
  sendPromptChangedNotification,
  sendResourceChangedNotification,
} from "./notifications.js";
import type {
  SystempromptPromptRequest,
  SystempromptBlockRequest,
  SystempromptPromptAPIRequest,
} from "../types/index.js";
import {
  CallToolRequest,
  CallToolResult,
  ListToolsRequest,
  ListToolsResult,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

interface CreatePromptArgs {
  title: string;
  description: string;
  static_instruction: string;
  dynamic_instruction: string;
  state: string;
  input_type: string[];
  output_type: string[];
}

interface EditPromptArgs {
  uuid: string;
  title?: string;
  description?: string;
  static_instruction?: string;
  dynamic_instruction?: string;
  state?: string;
  input_type?: string[];
  output_type?: string[];
}

interface CreateResourceArgs {
  title: string;
  description: string;
  content: string;
  prefix: string;
}

interface EditResourceArgs {
  uuid: string;
  title?: string;
  description?: string;
  content?: string;
  prefix?: string;
}

interface DeleteArgs {
  uuid: string;
}

interface FetchResourceArgs {
  uuid: string;
}

const TOOLS: Tool[] = [
  {
    name: "systemprompt_create_prompt",
    description: "Create a new systemprompt compatible prompt.",
    inputSchema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string" as const,
          description: "Title of the prompt",
        },
        description: {
          type: "string" as const,
          description: "Description of the prompt",
        },
        static_instruction: {
          type: "string" as const,
          description: "The static instruction template",
        },
        dynamic_instruction: {
          type: "string" as const,
          description: "The dynamic instruction template",
        },
        state: {
          type: "string" as const,
          description: "The state for the prompt",
        },
        input_type: {
          type: "array" as const,
          items: {
            type: "string" as const,
            enum: ["message", "structured_data"],
          },
        },
        output_type: {
          type: "array" as const,
          items: {
            type: "string" as const,
            enum: ["message", "structured_data"],
          },
        },
      },
      required: [
        "title",
        "description",
        "static_instruction",
        "dynamic_instruction",
        "state",
        "input_type",
        "output_type",
      ],
    },
  },
  {
    name: "systemprompt_create_resource",
    description: "Create a new resource block",
    inputSchema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string" as const,
          description: "Title of the resource",
        },
        description: {
          type: "string" as const,
          description: "Description of the resource",
        },
        content: {
          type: "string" as const,
          description: "The content of the resource",
        },
        prefix: {
          type: "string" as const,
          description: "The prefix for the resource",
        },
      },
      required: ["title", "description", "content", "prefix"],
    },
  },
  {
    name: "systemprompt_edit_prompt",
    description: "Edit an existing prompt",
    inputSchema: {
      type: "object" as const,
      properties: {
        uuid: {
          type: "string" as const,
          description: "UUID of the prompt to edit",
        },
        title: {
          type: "string" as const,
          description: "New title for the prompt",
        },
        description: {
          type: "string" as const,
          description: "New description for the prompt",
        },
        static_instruction: {
          type: "string" as const,
          description: "New static instruction",
        },
        dynamic_instruction: {
          type: "string" as const,
          description: "New dynamic instruction",
        },
        state: {
          type: "string" as const,
          description: "New state",
        },
        input_type: {
          type: "array" as const,
          items: {
            type: "string" as const,
            enum: ["message", "structured_data"],
          },
        },
        output_type: {
          type: "array" as const,
          items: {
            type: "string" as const,
            enum: ["message", "structured_data"],
          },
        },
      },
      required: ["uuid"],
    },
  },
  {
    name: "systemprompt_edit_resource",
    description: "Edit an existing resource",
    inputSchema: {
      type: "object" as const,
      properties: {
        uuid: {
          type: "string" as const,
          description: "UUID of the resource to edit",
        },
        title: {
          type: "string" as const,
          description: "New title for the resource",
        },
        description: {
          type: "string" as const,
          description: "New description for the resource",
        },
        content: {
          type: "string" as const,
          description: "New content for the resource",
        },
        prefix: {
          type: "string" as const,
          description: "New prefix for the resource",
        },
      },
      required: ["uuid"],
    },
  },
  {
    name: "systemprompt_delete_prompt",
    description: "Delete an existing prompt",
    inputSchema: {
      type: "object" as const,
      properties: {
        uuid: {
          type: "string" as const,
          description: "UUID of the prompt to delete",
        },
      },
      required: ["uuid"],
    },
  },
  {
    name: "systemprompt_fetch_resource",
    description: "Fetch an existing resource",
    inputSchema: {
      type: "object" as const,
      properties: {
        uuid: {
          type: "string" as const,
          description: "UUID of the resource to fetch",
        },
      },
      required: ["uuid"],
    },
  },
  {
    name: "systemprompt_delete_resource",
    description: "Delete an existing resource",
    inputSchema: {
      type: "object" as const,
      properties: {
        uuid: {
          type: "string" as const,
          description: "UUID of the resource to delete",
        },
      },
      required: ["uuid"],
    },
  },
];

export async function handleListTools(
  request: ListToolsRequest
): Promise<ListToolsResult> {
  return { tools: TOOLS };
}

export async function handleToolCall(
  request: CallToolRequest
): Promise<CallToolResult> {
  try {
    const service = SystemPromptService.getInstance();
    switch (request.params.name) {
      case "systemprompt_create_prompt": {
        const args = request.params.arguments as unknown as CreatePromptArgs;
        const promptData: SystempromptPromptAPIRequest = {
          metadata: {
            title: args.title,
            description: args.description,
          },
          instruction: {
            static: args.static_instruction,
            dynamic: args.dynamic_instruction,
            state: args.state,
          },
          input: {
            type: args.input_type,
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                },
              },
            },
            name: `${args.title}inputSchema`,
            description: `${args.title}inputDescription`,
          },
          output: {
            type: args.output_type,
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                },
              },
            },
            name: `${args.title}outputSchema`,
            description: `${args.title}outputDescription`,
          },
        };

        const result = await service.createPrompt(promptData);
        await sendPromptChangedNotification();
        return {
          content: [
            { type: "text", text: `Created prompt: ${result.metadata.title}` },
          ],
        };
      }

      case "systemprompt_edit_prompt": {
        const args = request.params.arguments as unknown as EditPromptArgs;
        const updateData: Partial<SystempromptPromptRequest> = {};

        if (args.title || args.description) {
          updateData.metadata = {
            title: args.title || "",
            description: args.description || "",
          };
        }

        if (args.static_instruction) {
          updateData.instruction = {
            static: args.static_instruction,
          };
        }

        if (args.input_type) {
          updateData.input = {
            type: args.input_type,
          };
        }

        if (args.output_type) {
          updateData.output = {
            type: args.output_type,
          };
        }

        const result = await service.editPrompt(args.uuid, updateData);
        await sendPromptChangedNotification();
        return {
          content: [
            { type: "text", text: `Updated prompt: ${result.metadata.title}` },
          ],
        };
      }

      case "systemprompt_create_resource": {
        const args = request.params.arguments as unknown as CreateResourceArgs;
        const blockData: SystempromptBlockRequest = {
          content: args.content,
          prefix: args.prefix,
          metadata: {
            title: args.title,
            description: args.description,
          },
        };

        const result = await service.createBlock(blockData);
        await sendResourceChangedNotification();
        return {
          content: [
            {
              type: "text",
              text: `Created resource: ${result.metadata.title}`,
            },
          ],
        };
      }

      case "systemprompt_edit_resource": {
        const args = request.params.arguments as unknown as EditResourceArgs;
        const updateData: Partial<SystempromptBlockRequest> = {};

        if (args.content) {
          updateData.content = args.content;
        }

        if (args.prefix) {
          updateData.prefix = args.prefix;
        }

        if (args.title || args.description) {
          updateData.metadata = {
            title: args.title || "",
            description: args.description || "",
          };
        }

        const result = await service.editBlock(args.uuid, updateData);
        await sendResourceChangedNotification();
        return {
          content: [
            {
              type: "text",
              text: `Updated resource: ${result.metadata.title}`,
            },
          ],
        };
      }

      case "systemprompt_fetch_resource": {
        const args = request.params.arguments as unknown as FetchResourceArgs;
        const result = await service.getBlock(args.uuid);
        return {
          content: [
            {
              type: "text",
              text: result.content,
            },
          ],
        };
      }

      case "systemprompt_delete_prompt": {
        const args = request.params.arguments as unknown as DeleteArgs;
        await service.deletePrompt(args.uuid);
        await sendPromptChangedNotification();
        return {
          content: [
            { type: "text", text: `Deleted prompt with UUID: ${args.uuid}` },
          ],
        };
      }

      case "systemprompt_delete_resource": {
        const args = request.params.arguments as unknown as DeleteArgs;
        await service.deleteBlock(args.uuid);
        await sendResourceChangedNotification();
        return {
          content: [
            { type: "text", text: `Deleted resource with UUID: ${args.uuid}` },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error: any) {
    if (error.message.startsWith("Unknown tool:")) {
      throw error;
    }
    throw new Error(
      `Failed to ${request.params.name.replace("_", " ")}: ${error.message}`
    );
  }
}
