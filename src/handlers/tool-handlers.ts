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
    description:
      "Creates a new prompt template with static and dynamic instructions. Supports both message and structured data formats for input/output. Requires title, description, instructions, and type definitions.",
    inputSchema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string" as const,
          description:
            "PascalCase or camelCase title that uniquely identifies this prompt template. Used for display and reference purposes.",
        },
        description: {
          type: "string" as const,
          description:
            "Detailed explanation (max 200 chars) of the prompt's purpose, behavior, and expected usage. Should be clear and concise.",
        },
        static_instruction: {
          type: "string" as const,
          description:
            "Core instruction template that remains constant. Defines the base behavior and rules that don't change between invocations.",
        },
        dynamic_instruction: {
          type: "string" as const,
          description:
            "Variable instruction template that can be modified at runtime. Contains placeholders for context-specific information.",
        },
        state: {
          type: "string" as const,
          description:
            "JSON-serialized configuration state for the prompt. Stores settings and parameters that affect prompt behavior.",
        },
        input_type: {
          type: "array" as const,
          items: {
            type: "string" as const,
            enum: ["message", "structured_data"],
          },
          description:
            "Array of accepted input formats. 'message' for text, 'structured_data' for JSON. Determines how input is processed.",
        },
        output_type: {
          type: "array" as const,
          items: {
            type: "string" as const,
            enum: ["message", "structured_data"],
          },
          description:
            "Array of supported output formats. 'message' for text, 'structured_data' for JSON. Defines response structure.",
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
    description:
      "Creates a new resource block that can be referenced by prompts. Resources are reusable content blocks that can be included in multiple prompts. Requires title, description, content, and unique prefix.",
    inputSchema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string" as const,
          description:
            "PascalCase or camelCase title that uniquely identifies this resource block. Used for display and reference.",
        },
        description: {
          type: "string" as const,
          description:
            "Detailed explanation (max 200 chars) of the resource's purpose and intended usage within prompt templates.",
        },
        content: {
          type: "string" as const,
          description:
            "The actual content of the resource block. Can contain text, templates, or structured data to be included in prompts.",
        },
        prefix: {
          type: "string" as const,
          description:
            "Unique alphanumeric identifier (no spaces/special chars) used to reference this resource within prompt templates.",
        },
      },
      required: ["title", "description", "content", "prefix"],
    },
  },
  {
    name: "systemprompt_edit_prompt",
    description:
      "Modifies an existing prompt template by UUID. Supports partial updates to title, description, instructions, state, and input/output types. Only specified fields will be updated.",
    inputSchema: {
      type: "object" as const,
      properties: {
        uuid: {
          type: "string" as const,
          description:
            "Unique identifier of the prompt template to modify. Must be a valid UUID of an existing prompt.",
        },
        title: {
          type: "string" as const,
          description:
            "New PascalCase or camelCase title for the prompt template. Optional - only updated if specified.",
        },
        description: {
          type: "string" as const,
          description:
            "New detailed explanation (max 200 chars) of the prompt's purpose. Optional - only updated if specified.",
        },
        static_instruction: {
          type: "string" as const,
          description:
            "New core instruction template. Optional - only updated if specified. Replaces entire static instruction.",
        },
        dynamic_instruction: {
          type: "string" as const,
          description:
            "New variable instruction template. Optional - only updated if specified. Replaces entire dynamic instruction.",
        },
        state: {
          type: "string" as const,
          description:
            "New JSON-serialized configuration state. Optional - only updated if specified. Replaces entire state object.",
        },
        input_type: {
          type: "array" as const,
          items: {
            type: "string" as const,
            enum: ["message", "structured_data"],
          },
          description:
            "New array of accepted input formats. Optional - only updated if specified. Replaces entire input type array.",
        },
        output_type: {
          type: "array" as const,
          items: {
            type: "string" as const,
            enum: ["message", "structured_data"],
          },
          description:
            "New array of supported output formats. Optional - only updated if specified. Replaces entire output type array.",
        },
      },
      required: ["uuid"],
    },
  },
  {
    name: "systemprompt_edit_resource",
    description:
      "Updates an existing resource block by UUID. Allows modification of title, description, content, and prefix. Supports partial updates where only specified fields are modified.",
    inputSchema: {
      type: "object" as const,
      properties: {
        uuid: {
          type: "string" as const,
          description:
            "Unique identifier of the resource block to modify. Must be a valid UUID of an existing resource.",
        },
        title: {
          type: "string" as const,
          description:
            "New PascalCase or camelCase title for the resource. Optional - only updated if specified.",
        },
        description: {
          type: "string" as const,
          description:
            "New detailed explanation (max 200 chars) of the resource's purpose. Optional - only updated if specified.",
        },
        content: {
          type: "string" as const,
          description:
            "New content for the resource block. Optional - only updated if specified. Replaces entire content.",
        },
        prefix: {
          type: "string" as const,
          description:
            "New unique alphanumeric identifier (no spaces/special chars). Optional - only updated if specified.",
        },
      },
      required: ["uuid"],
    },
  },
  {
    name: "systemprompt_delete_prompt",
    description:
      "Permanently removes a prompt template by its UUID. This action cannot be undone and will remove all associated configurations and mappings.",
    inputSchema: {
      type: "object" as const,
      properties: {
        uuid: {
          type: "string" as const,
          description:
            "Unique identifier of the prompt template to delete. Must be a valid UUID. Operation cannot be undone.",
        },
      },
      required: ["uuid"],
    },
  },
  {
    name: "systemprompt_fetch_resource",
    description:
      "Retrieves the complete content and metadata of a specific resource block by its UUID. Returns the raw content for use in prompt templates.",
    inputSchema: {
      type: "object" as const,
      properties: {
        uuid: {
          type: "string" as const,
          description:
            "Unique identifier of the resource block to retrieve. Must be a valid UUID of an existing resource.",
        },
      },
      required: ["uuid"],
    },
  },
  {
    name: "systemprompt_delete_resource",
    description:
      "Permanently removes a resource block by its UUID. This action cannot be undone and will remove the resource from all associated prompts.",
    inputSchema: {
      type: "object" as const,
      properties: {
        uuid: {
          type: "string" as const,
          description:
            "Unique identifier of the resource block to delete. Must be a valid UUID. Operation cannot be undone.",
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
        process.nextTick(async () => {
          try {
            await sendPromptChangedNotification();
          } catch (error) {
            console.error("Failed to send prompt changed notification:", error);
          }
        });
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
        process.nextTick(async () => {
          try {
            await sendPromptChangedNotification();
          } catch (error) {
            console.error("Failed to send prompt changed notification:", error);
          }
        });
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
        process.nextTick(async () => {
          try {
            await sendResourceChangedNotification();
          } catch (error) {
            console.error(
              "Failed to send resource changed notification:",
              error
            );
          }
        });
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

        if (args.title || args.description) {
          updateData.metadata = {
            title: args.title || "",
            description: args.description || "",
          };
        }

        if (args.content) {
          updateData.content = args.content;
        }

        if (args.prefix) {
          updateData.prefix = args.prefix;
        }

        const result = await service.editBlock(args.uuid, updateData);
        process.nextTick(async () => {
          try {
            await sendResourceChangedNotification();
          } catch (error) {
            console.error(
              "Failed to send resource changed notification:",
              error
            );
          }
        });
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
        process.nextTick(async () => {
          try {
            await sendPromptChangedNotification();
          } catch (error) {
            console.error("Failed to send prompt changed notification:", error);
          }
        });
        return {
          content: [{ type: "text", text: "Deleted prompt" }],
        };
      }

      case "systemprompt_delete_resource": {
        const args = request.params.arguments as unknown as DeleteArgs;
        await service.deleteBlock(args.uuid);
        process.nextTick(async () => {
          try {
            await sendResourceChangedNotification();
          } catch (error) {
            console.error(
              "Failed to send resource changed notification:",
              error
            );
          }
        });
        return {
          content: [{ type: "text", text: "Deleted resource" }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error: any) {
    console.error("Tool call failed:", error);
    throw new Error(`Tool call failed: ${error.message || "Unknown error"}`);
  }
}
