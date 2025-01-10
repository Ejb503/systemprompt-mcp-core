import type {
  Block,
  CreatePromptInput,
  EditPromptInput,
  PromptCreationResult,
} from "../types/index.js";
import { handleApiError, handleServiceError } from "../utils/error-handling.js";

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
      } catch (error) {
        return handleServiceError(error, "parse API response");
      }

      if (!response.ok) {
        return handleApiError(responseData);
      }

      return responseData;
    } catch (error) {
      return handleServiceError(error, "make API request");
    }
  }

  async getAllPrompts(): Promise<PromptCreationResult[]> {
    try {
      return await this.request<PromptCreationResult[]>("/prompts", "GET");
    } catch (error) {
      return handleServiceError(error, "fetch prompts");
    }
  }

  async createPrompt(data: CreatePromptInput): Promise<PromptCreationResult> {
    try {
      return await this.request<PromptCreationResult>("/prompts", "POST", data);
    } catch (error) {
      return handleServiceError(error, "create prompt");
    }
  }

  async editPrompt(
    uuid: string,
    data: EditPromptInput
  ): Promise<PromptCreationResult> {
    try {
      return await this.request<PromptCreationResult>(
        `/prompts/${uuid}`,
        "PUT",
        data
      );
    } catch (error) {
      return handleServiceError(error, "edit prompt");
    }
  }

  async listBlocks(): Promise<Block[]> {
    try {
      return await this.request<Block[]>("/blocks", "GET");
    } catch (error) {
      return handleServiceError(error, "list blocks");
    }
  }

  async getBlock(blockId: string): Promise<Block> {
    try {
      return await this.request<Block>(`/blocks/${blockId}`, "GET");
    } catch (error) {
      return handleServiceError(error, "get block");
    }
  }

  async createBlock(data: any): Promise<Block> {
    try {
      return await this.request<Block>("/blocks", "POST", data);
    } catch (error) {
      return handleServiceError(error, "create block");
    }
  }

  async editBlock(blockId: string, data: any): Promise<Block> {
    try {
      return await this.request<Block>(`/blocks/${blockId}`, "PUT", data);
    } catch (error) {
      return handleServiceError(error, "edit block");
    }
  }
}
