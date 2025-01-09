import {
  CreatePromptInput,
  EditPromptInput,
  CreateBlockInput,
  EditBlockInput,
  PromptCreationResult,
  BlockCreationResult,
} from "../types/index.js";

let apiKey: string | null = null;

export function initializeService(key: string) {
  apiKey = key;
}

export function getApiKey() {
  if (!apiKey) {
    throw new Error("Service not initialized");
  }
  return apiKey;
}

export class SystemPromptService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://api.systemprompt.io/v1";
  }

  initialize(key: string) {
    apiKey = key;
  }

  private async request<T>(
    endpoint: string,
    method: string = "GET",
    data?: any
  ): Promise<T> {
    if (!apiKey) {
      throw new Error("Service not initialized");
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
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
