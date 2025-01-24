import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const TOOL_ERROR_MESSAGES = {
  UNKNOWN_TOOL: "Unknown tool:",
  TOOL_CALL_FAILED: "Tool call failed:",
} as const;

export const TOOL_RESPONSE_MESSAGES = {
  ASYNC_PROCESSING: "Request is being processed asynchronously",
} as const;

export const TOOLS: Tool[] = [
  {
    name: "systemprompt_heartbeat",
    description:
      "Returns a heartbeat response to indicate that the server is running. Will return the user's current status.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "systemprompt_fetch_resources",
    description: "Fetches the user's resources, agents, and prompts.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "systemprompt_create_resource",
    description:
      "Creates a new resource based on the provided type and instructions.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["prompt", "block", "agent"],
          description: "The type of resource to create",
        },
        userInstructions: {
          type: "string",
          description: "Instructions for creating the resource",
        },
      },
      required: ["type", "userInstructions"],
    },
  },
  {
    name: "systemprompt_update_resource",
    description:
      "Updates an existing resource based on the provided type and instructions.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the resource to update.",
        },
        type: {
          type: "string",
          enum: ["prompt", "block", "agent"],
          description: "The type of resource to update",
        },
        userInstructions: {
          type: "string",
          description: "Instructions for updating the resource",
        },
      },
      required: ["id", "type", "userInstructions"],
    },
  },
  {
    name: "systemprompt_delete_resource",
    description:
      "Deletes an existing resource, agent, or prompt. Will return the resource's current status.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the resource to delete.",
        },
      },
      required: ["id"],
    },
  },
  //   {
  //   name: "systempromt_execute_prompt",
  //   description:
  //     "Executes a prompt and returns the result.",
  //   inputSchema: {
  //     type: "object",
  //     properties: {
  //       id: {
  //         type: "string",
  //         description: "The ID of the prompt to execute.",
  //       },
  //     },
  //     required: ["id"],
  //   },
  // },

];
