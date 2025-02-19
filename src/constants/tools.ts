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
    name: "systemprompt_introduction",
    description:
      "Returns a introduction to systemprompt.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "systemprompt_config",
    description: "Configures the users preferences and interactions with the system.",
    inputSchema: {
      type: "object",
      description: "Configuration for personalizing AI interactions",
      properties: {
        name: {
          type: "string",
          description: "Your preferred name that the AI will use when addressing you in conversations",
          maxLength: 250
        },
        communication_formality: {
          type: "string", 
          description: "How formal the AI's language should be (e.g., 'casual' for relaxed communication, 'formal' for professional settings)",
          maxLength: 250
        },
        communication_tone: {
          type: "string",
          description: "The emotional tone the AI should use (e.g., 'friendly' for warm interactions, 'professional' for business-like communication)",
          maxLength: 250
        },
        communication_verbosity: {
          type: "string",
          description: "How detailed the AI's responses should be (e.g., 'concise' for brief answers, 'detailed' for comprehensive explanations)",
          maxLength: 250
        },
        communication_technical: {
          type: "string",
          description: "The technical level of language the AI should use (e.g., 'basic' for simple terms, 'advanced' for expert-level terminology)",
          maxLength: 250
        },
        expertise_background: {
          type: "string",
          description: "Your professional expertise and skills that help the AI understand your technical knowledge level"
        },
        expertise_history: {
          type: "string",
          description: "Your career history and experience to help the AI provide more relevant examples and analogies"
        },
        personal_background: {
          type: "string",
          description: "Your personal interests and experiences that help the AI make more meaningful connections in discussions"
        },
        personal_history: {
          type: "string",
          description: "Your learning journey and personal development that helps the AI understand your perspective"
        }
      },
      required: ["name"]
    },
    _meta: {
      callback: "require_systemprompt_user",
    },
  },
  // {
  //   name: "systemprompt_manage_resource",
  //   description:
  //     "Creates a new resource based on the provided type and instructions.",
  //   inputSchema: {
  //     type: "object",
  //     properties: {
  //       type: {
  //         type: "string",
  //         enum: ["prompt", "block", "agent"],
  //         description: "The type of resource to create",
  //       },
  //       userInstructions: {
  //         type: "string",
  //         description: "Instructions for creating the resource",
  //       },
  //     },
  //     required: ["type", "userInstructions"],
  //   },
  // },

];
