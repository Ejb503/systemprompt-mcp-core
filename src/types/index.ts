import type { JSONSchema7 } from "json-schema";

export interface Block {
  id: string;
  content: string;
  metadata: {
    title: string;
    description: string;
    created: string;
    updated: string;
    version: number;
    status: string;
    author: string;
    log_message: string;
  };
  _link?: string;
}

export interface BlockCreationResult {
  id: string;
  content: string;
  metadata: {
    title: string;
    description: string;
  };
}

export interface CreateBlockInput {
  content: string;
  metadata: {
    title: string;
    description: string;
  };
}

export interface EditBlockInput {
  content?: string;
  metadata?: {
    title?: string;
    description?: string;
  };
}

export interface CreatePromptInput {
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
    schema: JSONSchema7;
  };
  output: {
    name: string;
    description: string;
    type: string[];
    schema: JSONSchema7;
  };
}

export interface EditPromptInput {
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
    schema?: {
      type?: string;
      properties?: Record<string, any>;
    };
  };
  output?: {
    name?: string;
    description?: string;
    type?: string[];
    schema?: {
      type?: string;
      properties?: Record<string, any>;
    };
  };
}

export interface PromptCreationResult {
  id: string;
  metadata: {
    title: string;
    description: string;
    created: string;
    updated: string;
    version: number;
    status: string;
    author: string;
    log_message: string;
  };
  instruction: {
    static: string;
  };
  input: {
    name: string;
    description: string;
    type: string[];
    schema: JSONSchema7;
  };
  output: {
    name: string;
    description: string;
    type: string[];
    schema: JSONSchema7;
  };
  _link: string;
}
