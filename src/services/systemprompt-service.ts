import { CreatePromptInput, PromptCreationResult } from "../types/index.js";

export class SystemPromptService {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl: string = "https://systemprompt.io/api") {
    this.apiBaseUrl = apiBaseUrl;
  }

  async createPrompt(input: CreatePromptInput): Promise<PromptCreationResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Failed to create prompt: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        promptId: data.id,
        systemPrompt: data.systemPrompt,
      };
    } catch (error) {
      throw new Error(
        `Error creating prompt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getPrompt(promptId: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/prompts/${promptId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch prompt: ${response.statusText}`);
      }

      const data = await response.json();
      return data.systemPrompt;
    } catch (error) {
      throw new Error(
        `Error fetching prompt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
