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

  async getAllPrompt() {
    return this.request<any[]>("/prompt");
  }

  async getPrompt(id: string) {
    return this.request<any>(`/prompt/${id}`);
  }

  async listblock() {
    return this.request<any[]>("/block");
  }

  async getBlock(id: string) {
    return this.request<any>(`/block/${id}`);
  }

  async createBlock(data: any) {
    return this.request<any>("/block", "POST", data);
  }

  async updateBlock(id: string, data: any) {
    return this.request<any>(`/block/${id}`, "PUT", data);
  }

  async deleteBlock(id: string) {
    return this.request<void>(`/block/${id}`, "DELETE");
  }

  async createPrompt(data: any) {
    return this.request<any>("/prompt", "POST", data);
  }

  async updatePrompt(id: string, data: any) {
    return this.request<any>(`/prompt/${id}`, "PUT", data);
  }

  async editPrompt(id: string, data: any) {
    return this.request<any>(`/prompt/${id}`, "PUT", data);
  }

  async deletePrompt(id: string) {
    return this.request<void>(`/prompt/${id}`, "DELETE");
  }
}
