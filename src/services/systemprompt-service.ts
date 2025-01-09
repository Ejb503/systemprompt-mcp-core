import {
  CreatePromptInput,
  EditPromptInput,
  CreateBlockInput,
  EditBlockInput,
  PromptCreationResult,
  BlockCreationResult,
  Block,
} from "../types/index.js";

export class SystemPromptService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.SYSTEMPROMPT_API_KEY || "";
    this.baseUrl = "https://api.systemprompt.io/v1";
  }

  private async request<T>(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        throw new Error("API request failed");
      }

      if (!response.ok) {
        throw new Error(responseData.message || "API request failed");
      }

      return responseData;
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error("API request failed");
    }
  }

  async getAllPrompts(): Promise<PromptCreationResult[]> {
    return this.request<PromptCreationResult[]>("/prompt", "GET");
  }

  async createPrompt(data: CreatePromptInput): Promise<PromptCreationResult> {
    return this.request<PromptCreationResult>("/prompt", "POST", data);
  }

  async editPrompt(
    uuid: string,
    data: Partial<CreatePromptInput>
  ): Promise<PromptCreationResult> {
    return this.request<PromptCreationResult>(`/prompt/${uuid}`, "PUT", data);
  }

  async createBlock(data: CreateBlockInput): Promise<BlockCreationResult> {
    return this.request<BlockCreationResult>("/block", "POST", data);
  }

  async editBlock(
    uuid: string,
    data: Partial<CreateBlockInput>
  ): Promise<BlockCreationResult> {
    return this.request<BlockCreationResult>(`/block/${uuid}`, "PUT", data);
  }

  async listBlocks(): Promise<Block[]> {
    return this.request<Block[]>("/block", "GET");
  }

  async getBlock(blockId: string): Promise<Block> {
    return this.request<Block>(`/block/${blockId}`, "GET");
  }
}
