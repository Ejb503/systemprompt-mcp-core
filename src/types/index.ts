export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface Block {
  id: string;
  name: string;
  description: string;
  content: string;
  type: string;
}

export interface PromptTemplate {
  title: string;
  description: string;
  systemPrompt: string;
}

export interface CreatePromptInput {
  instruction: {
    static: string;
    state?: string;
    dynamic?: string;
  };
  input: {
    name: string;
    description: string;
    type: Array<"message" | "structured_data" | "artifact">;
  };
  output: {
    name: string;
    description: string;
    type: Array<"message" | "structured_data" | "artifact">;
  };
  metadata: {
    title: string;
    description: string;
    tag?: string[];
  };
}

export interface EditPromptInput extends Partial<CreatePromptInput> {
  uuid: string;
}

export interface CreateBlockInput {
  content: string;
  prefix?: string;
  metadata: {
    title: string;
    description: string;
    tag?: string[];
  };
}

export interface EditBlockInput extends Partial<CreateBlockInput> {
  uuid: string;
}

export interface PromptCreationResult {
  id: string;
  instruction: CreatePromptInput["instruction"];
  input: CreatePromptInput["input"];
  output: CreatePromptInput["output"];
  metadata: CreatePromptInput["metadata"] & {
    created: string;
    updated: string;
    version: number;
    status: "draft" | "published" | "archived";
    author: string;
    log_message: string;
  };
  _link: string;
}

export interface BlockCreationResult {
  id: string;
  content: string;
  prefix?: string;
  metadata: CreateBlockInput["metadata"] & {
    created: string;
    updated: string;
    version: number;
    status: "draft" | "published" | "archived";
    author: string;
    log_message: string;
  };
  _link: string;
}

/**
 * Interface for resource call requests
 */
export interface ResourceCallRequest {
  method: "resources/read";
  params: {
    uri: string;
    _meta?: {
      progressToken?: string | number;
    };
  };
}
