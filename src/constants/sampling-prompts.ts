import { SamplingPrompt } from "../types/sampling.js";
import {
  SystempromptPromptRequestSchema,
  SystempromptBlockRequestSchema,
  SystempromptAgentRequestSchema,
} from "../schemas/generated/index.js";
import { AGENT_CREATOR_INSTRUCTIONS, AGENT_EDITOR_INSTRUCTIONS, BLOCK_CREATOR_INSTRUCTIONS, BLOCK_EDITOR_INSTRUCTIONS, PROMPT_CREATOR_INSTRUCTIONS, PROMPT_EDITOR_INSTRUCTIONS } from "./instructions.js";

const promptArgs = [
  {
    name: "userInstructions",
    description: "Instructions for creating/editing the resource",
    required: true,
  },
];
// Prompt Creation Prompt
export const CREATE_PROMPT_PROMPT: SamplingPrompt = {
  name: "CreatePrompt",
  description: "Creates a new systemprompt prompt based on user instructions",
  arguments: promptArgs,
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: PROMPT_CREATOR_INSTRUCTIONS,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `<input><userInstructions>{{userInstructions}}</userInstructions></input>`,
      },
    },
  ],
  _meta: {
    complexResponseSchema: SystempromptPromptRequestSchema,
    callback: "systemprompt_create_prompt",
  },
};

// Prompt Edit Prompt
export const EDIT_PROMPT_PROMPT: SamplingPrompt = {
  name: "EditPrompt",
  description:
    "Modifies an existing systemprompt prompt based on user instructions",
  arguments: promptArgs,
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: PROMPT_EDITOR_INSTRUCTIONS,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `<input><userInstructions>{{userInstructions}}</userInstructions></input>`,
      },
    },
  ],
  _meta: {
    complexResponseSchema: SystempromptPromptRequestSchema,
    callback: "systemprompt_edit_prompt",
  },
};

// Block Creation Prompt
export const CREATE_BLOCK_PROMPT: SamplingPrompt = {
  name: "CreateBlock",
  description: "Creates a new systemprompt block based on user instructions",
  arguments: promptArgs,
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: BLOCK_CREATOR_INSTRUCTIONS,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `<input><userInstructions>{{userInstructions}}</userInstructions></input>`,
      },
    },
  ],
  _meta: {
    complexResponseSchema: SystempromptBlockRequestSchema,
    callback: "systemprompt_create_block",
  },
};

// Block Edit Prompt
export const EDIT_BLOCK_PROMPT: SamplingPrompt = {
  name: "EditBlock",
  description:
    "Modifies an existing systemprompt block based on user instructions",
  arguments: promptArgs,
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: BLOCK_EDITOR_INSTRUCTIONS,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `<input><userInstructions>{{userInstructions}}</userInstructions></input>`,
      },
    },
  ],
  _meta: {
    complexResponseSchema: SystempromptBlockRequestSchema,
    callback: "systemprompt_edit_block",
  },
};

// Agent Creation Prompt
export const CREATE_AGENT_PROMPT: SamplingPrompt = {
  name: "CreateAgent",
  description: "Creates a new systemprompt agent based on user instructions",
  arguments: promptArgs,
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: AGENT_CREATOR_INSTRUCTIONS,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `<input><userInstructions>{{userInstructions}}</userInstructions></input>`,
      },
    },
  ],
  _meta: {
    complexResponseSchema: SystempromptAgentRequestSchema,
    callback: "systemprompt_create_agent",
  },
};

// Agent Edit Prompt
export const EDIT_AGENT_PROMPT: SamplingPrompt = {
  name: "EditAgent",
  description:
    "Modifies an existing systemprompt agent based on user instructions",
  arguments: promptArgs,
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: AGENT_EDITOR_INSTRUCTIONS,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `<input><userInstructions>{{userInstructions}}</userInstructions></input>`,
      },
    },
  ],
  _meta: {
    complexResponseSchema: SystempromptAgentRequestSchema,
    callback: "systemprompt_edit_agent",
  },
};

// Export all prompts
export const SYSTEMPROMPT_PROMPTS = [
  CREATE_PROMPT_PROMPT,
  EDIT_PROMPT_PROMPT,
  CREATE_BLOCK_PROMPT,
  EDIT_BLOCK_PROMPT,
  CREATE_AGENT_PROMPT,
  EDIT_AGENT_PROMPT,
];
