import {
  CreatePromptInput,
  EditPromptInput,
  CreateBlockInput,
  EditBlockInput,
  PromptCreationResult,
  BlockCreationResult,
} from "../types/index.js";

export class SystemPromptService {
  private static instance: SystemPromptService;
  private baseUrl: string;
  private apiKey: string | null = null;

  private constructor() {
    this.baseUrl = "https://api.systemprompt.io/v1";
  }

  static getInstance(): SystemPromptService {
    if (!SystemPromptService.instance) {
      SystemPromptService.instance = new SystemPromptService();
    }
    return SystemPromptService.instance;
  }

  initialize(key: string) {
    this.apiKey = key;
  }

  private async request<T>(
    endpoint: string,
    method: string = "GET",
    data?: any
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error(
        "Service not initialized. Call initialize() with API key first."
      );
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`API Error Response: ${text}`);
      throw new Error(`API request failed: ${response.statusText} - ${text}`);
    }

    try {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error(`Failed to parse JSON response: ${text}`);
        throw new Error(
          `Invalid JSON response from API: ${text.slice(0, 100)}...`
        );
      }
    } catch (error) {
      console.error("Error processing response:", error);
      throw error;
    }
  }

  async getAllPrompt(): Promise<PromptCreationResult[]> {
    return this.request<PromptCreationResult[]>("/prompt");
  }

  async getPrompt(id: string): Promise<PromptCreationResult> {
    return this.request<PromptCreationResult>(`/prompt/${id}`);
  }

  async listblock(): Promise<BlockCreationResult[]> {
    return this.request<BlockCreationResult[]>("/block");
  }

  async getBlock(id: string): Promise<BlockCreationResult> {
    return this.request<BlockCreationResult>(`/block/${id}`);
  }

  async createBlock(data: CreateBlockInput): Promise<BlockCreationResult> {
    return this.request<BlockCreationResult>("/block", "POST", data);
  }

  async updateBlock(
    id: string,
    data: EditBlockInput
  ): Promise<BlockCreationResult> {
    return this.request<BlockCreationResult>(`/block/${id}`, "PUT", data);
  }

  async deleteBlock(id: string): Promise<void> {
    return this.request<void>(`/block/${id}`, "DELETE");
  }

  async createPrompt(data: CreatePromptInput): Promise<PromptCreationResult> {
    return this.request<PromptCreationResult>("/prompt", "POST", data);
  }

  async updatePrompt(
    id: string,
    data: EditPromptInput
  ): Promise<PromptCreationResult> {
    return this.request<PromptCreationResult>(`/prompt/${id}`, "PUT", data);
  }

  async editPrompt(
    id: string,
    data: EditPromptInput
  ): Promise<PromptCreationResult> {
    return this.request<PromptCreationResult>(`/prompt/${id}`, "PUT", data);
  }

  async deletePrompt(id: string): Promise<void> {
    return this.request<void>(`/prompt/${id}`, "DELETE");
  }
}
