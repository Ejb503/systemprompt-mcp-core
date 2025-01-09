import type {
  SystempromptBlockRequest,
  SystempromptPromptRequest,
  SystempromptBlockResponse,
  SystempromptPromptResponse,
} from "../types/index.js";

export class SystemPromptService {
  private static instance: SystemPromptService | null = null;
  private apiKey: string;
  private baseUrl: string;

  private constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = "https://api.systemprompt.io/v1";
  }

  public static initialize(apiKey: string): void {
    SystemPromptService.instance = new SystemPromptService(apiKey);
  }

  public static getInstance(): SystemPromptService {
    if (!SystemPromptService.instance) {
      throw new Error(
        "SystemPromptService must be initialized with an API key first"
      );
    }
    return SystemPromptService.instance;
  }

  public static cleanup(): void {
    SystemPromptService.instance = null;
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
        if (response.status === 403) {
          throw new Error("Invalid API key");
        }
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

  async getAllPrompts(): Promise<SystempromptPromptResponse[]> {
    return this.request<SystempromptPromptResponse[]>("/prompt", "GET");
  }

  async createPrompt(
    data: SystempromptPromptRequest
  ): Promise<SystempromptPromptResponse> {
    return this.request<SystempromptPromptResponse>("/prompt", "POST", data);
  }

  async editPrompt(
    uuid: string,
    data: Partial<SystempromptPromptRequest>
  ): Promise<SystempromptPromptResponse> {
    return this.request<SystempromptPromptResponse>(
      `/prompt/${uuid}`,
      "PUT",
      data
    );
  }

  async createBlock(
    data: SystempromptBlockRequest
  ): Promise<SystempromptBlockResponse> {
    return this.request<SystempromptBlockResponse>("/block", "POST", data);
  }

  async editBlock(
    uuid: string,
    data: Partial<SystempromptBlockRequest>
  ): Promise<SystempromptBlockResponse> {
    return this.request<SystempromptBlockResponse>(
      `/block/${uuid}`,
      "PUT",
      data
    );
  }

  async listBlocks(): Promise<SystempromptBlockResponse[]> {
    return this.request<SystempromptBlockResponse[]>("/block", "GET");
  }

  async getBlock(blockId: string): Promise<SystempromptBlockResponse> {
    return this.request<SystempromptBlockResponse>(`/block/${blockId}`, "GET");
  }

  async deletePrompt(uuid: string): Promise<void> {
    return this.request<void>(`/prompt/${uuid}`, "DELETE");
  }

  async deleteBlock(uuid: string): Promise<void> {
    return this.request<void>(`/block/${uuid}`, "DELETE");
  }
}
