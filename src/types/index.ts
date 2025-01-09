export interface PromptTemplate {
  title: string;
  description: string;
  systemPrompt: string;
}

export interface CreatePromptInput {
  title: string;
  description: string;
}

export interface SystemPromptResource {
  uri: string;
  contentUrl: string;
  type: "API Schema" | "Prompt";
  description: string;
}

export interface PromptCreationResult {
  promptId: string;
  systemPrompt: string;
}
