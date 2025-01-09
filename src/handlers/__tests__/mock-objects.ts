import type { PromptCreationResult } from "../../types/index.js";
import type { Prompt } from "@modelcontextprotocol/sdk/types.js";

// Basic mock with simple string input
export const mockSystemPromptResult: PromptCreationResult = {
  id: "123",
  instruction: {
    static: "You are a helpful assistant that helps users write documentation.",
  },
  input: {
    name: "message",
    description: "The user's documentation request",
    type: ["message"],
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The user's documentation request",
        },
      },
      required: ["message"],
    },
  },
  output: {
    name: "response",
    description: "The assistant's response",
    type: ["message"],
    schema: {
      type: "object",
      properties: {
        response: {
          type: "string",
          description: "The assistant's response",
        },
      },
      required: ["response"],
    },
  },
  metadata: {
    title: "Documentation Helper",
    description: "An assistant that helps users write better documentation",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    version: 1,
    status: "published",
    author: "test-user",
    log_message: "Initial creation",
  },
  _link: "https://systemprompt.io/prompts/123",
};

// Mock with array input
export const mockArrayPromptResult: PromptCreationResult = {
  id: "124",
  instruction: {
    static:
      "You are a helpful assistant that helps users manage their todo lists.",
  },
  input: {
    name: "todos",
    description: "The user's todo list items",
    type: ["structured_data"],
    schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "List of todo items",
          items: {
            type: "string",
            description: "A todo item",
          },
          minItems: 1,
        },
        priority: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Priority level for the items",
        },
      },
      required: ["items"],
    },
  },
  output: {
    name: "organized_todos",
    description: "The organized todo list",
    type: ["structured_data"],
    schema: {
      type: "object",
      properties: {
        organized_items: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
      required: ["organized_items"],
    },
  },
  metadata: {
    title: "Todo List Organizer",
    description: "An assistant that helps users organize their todo lists",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    version: 1,
    status: "published",
    author: "test-user",
    log_message: "Initial creation",
  },
  _link: "https://systemprompt.io/prompts/124",
};

// Mock with nested object input
export const mockNestedPromptResult: PromptCreationResult = {
  id: "125",
  instruction: {
    static:
      "You are a helpful assistant that helps users manage their contacts.",
  },
  input: {
    name: "contact",
    description: "The contact information",
    type: ["structured_data"],
    schema: {
      type: "object",
      properties: {
        person: {
          type: "object",
          description: "Person's information",
          properties: {
            name: {
              type: "object",
              properties: {
                first: {
                  type: "string",
                  description: "First name",
                },
                last: {
                  type: "string",
                  description: "Last name",
                },
              },
              required: ["first", "last"],
            },
            contact: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  description: "Email address",
                  format: "email",
                },
                phone: {
                  type: "string",
                  description: "Phone number",
                  pattern: "^\\+?[1-9]\\d{1,14}$",
                },
              },
              required: ["email"],
            },
          },
          required: ["name"],
        },
        tags: {
          type: "array",
          description: "Contact tags",
          items: {
            type: "string",
          },
        },
      },
      required: ["person"],
    },
  },
  output: {
    name: "formatted_contact",
    description: "The formatted contact information",
    type: ["structured_data"],
    schema: {
      type: "object",
      properties: {
        formatted: {
          type: "string",
        },
      },
      required: ["formatted"],
    },
  },
  metadata: {
    title: "Contact Manager",
    description: "An assistant that helps users manage their contacts",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    version: 1,
    status: "published",
    author: "test-user",
    log_message: "Initial creation",
  },
  _link: "https://systemprompt.io/prompts/125",
};

// Expected MCP format for basic mock
export const mockMCPPrompt: Prompt = {
  name: "Documentation Helper",
  description: "An assistant that helps users write better documentation",
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "You are a helpful assistant that helps users write documentation.",
      },
    },
  ],
  arguments: [
    {
      name: "message",
      description: "The user's documentation request",
      required: true,
    },
  ],
};

// Expected MCP format for array mock
export const mockArrayMCPPrompt: Prompt = {
  name: "Todo List Organizer",
  description: "An assistant that helps users organize their todo lists",
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "You are a helpful assistant that helps users manage their todo lists.",
      },
    },
  ],
  arguments: [
    {
      name: "items",
      description: "List of todo items",
      required: true,
    },
    {
      name: "priority",
      description: "Priority level for the items",
      required: false,
    },
  ],
};

// Expected MCP format for nested mock
export const mockNestedMCPPrompt: Prompt = {
  name: "Contact Manager",
  description: "An assistant that helps users manage their contacts",
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "You are a helpful assistant that helps users manage their contacts.",
      },
    },
  ],
  arguments: [
    {
      name: "person",
      description: "Person's information",
      required: true,
    },
    {
      name: "tags",
      description: "Contact tags",
      required: false,
    },
  ],
};
