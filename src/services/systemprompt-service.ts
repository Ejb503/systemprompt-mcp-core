import type {
  SystempromptBlockRequest,
  SystempromptPromptRequest,
  SystempromptBlockResponse,
  SystempromptPromptResponse,
  SystempromptUserStatusResponse,
  SystempromptAgentResponse,
  SystempromptAgentRequest,
} from "../types/index.js";

export class SystemPromptService {
  private static instance: SystemPromptService | null = null;
  private apiKey: string;
  private baseUrl: string;

  private constructor(apiKey: string, baseUrl?: string) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || "https://api.systemprompt.io/v1";
  }

  public static initialize(apiKey: string, baseUrl?: string): void {
    SystemPromptService.instance = new SystemPromptService(apiKey, baseUrl);
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

  private async fetch(
    method: string,
    path: string,
    body?: unknown
  ): Promise<Response> {
    const url = new URL(path, this.baseUrl).toString();
    return fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${path}`;
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : undefined;
      } catch (error) {
        throw new Error("Failed to parse API response");
      }

      if (!response.ok) {
        switch (response.status) {
          case 403:
            throw new Error("Invalid API key");
          case 404:
            throw new Error("Resource not found - it may have been deleted");
          case 409:
            throw new Error("Resource conflict - it may have been edited");
          case 400:
            throw new Error("Invalid data");
          default:
            throw new Error(data?.message || "API request failed");
        }
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Failed to fetch") {
          throw new Error("API request failed");
        }
        throw error;
      }
      throw new Error("API request failed");
    }
  }

  async getAllPrompts(): Promise<SystempromptPromptResponse[]> {
    return this.request<SystempromptPromptResponse[]>("GET", "/prompt");
  }

  async createPrompt(
    data: SystempromptPromptRequest
  ): Promise<SystempromptPromptResponse> {
    return this.request<SystempromptPromptResponse>("POST", "/prompt", data);
  }

  async editPrompt(
    uuid: string,
    data: Partial<SystempromptPromptRequest>
  ): Promise<SystempromptPromptResponse> {
    return this.request<SystempromptPromptResponse>(
      "PUT",
      `/prompt/${uuid}`,
      data
    );
  }

  async deletePrompt(uuid: string): Promise<void> {
    return this.request<void>("DELETE", `/prompt/${uuid}`);
  }

  async createBlock(
    data: SystempromptBlockRequest
  ): Promise<SystempromptBlockResponse> {
    return this.request<SystempromptBlockResponse>("POST", "/block", data);
  }

  async editBlock(
    uuid: string,
    data: Partial<SystempromptBlockRequest>
  ): Promise<SystempromptBlockResponse> {
    return this.request<SystempromptBlockResponse>(
      "PUT",
      `/block/${uuid}`,
      data
    );
  }

  async listBlocks(): Promise<SystempromptBlockResponse[]> {
    return this.request<SystempromptBlockResponse[]>("GET", "/block");
  }

  async getBlock(blockId: string): Promise<SystempromptBlockResponse> {
    return this.request<SystempromptBlockResponse>("GET", `/block/${blockId}`);
  }

  async getAgent(agentId: string): Promise<SystempromptAgentResponse> {
    return this.request<SystempromptAgentResponse>("GET", `/agent/${agentId}`);
  }

  async listAgents(): Promise<SystempromptAgentResponse[]> {
    return this.request<SystempromptAgentResponse[]>("GET", "/agent");
  }

  async createAgent(
    data: SystempromptAgentRequest
  ): Promise<SystempromptAgentResponse> {
    return this.request<SystempromptAgentResponse>("POST", "/agent", data);
  }

  async editAgent(
    uuid: string,
    data: Partial<SystempromptAgentRequest>
  ): Promise<SystempromptAgentResponse> {
    return this.request<SystempromptAgentResponse>(
      "PUT",
      `/agent/${uuid}`,
      data
    );
  }

  async deleteBlock(uuid: string): Promise<void> {
    return this.request<void>("DELETE", `/block/${uuid}`);
  }

  async fetchUserStatus(): Promise<SystempromptUserStatusResponse> {
    return this.request<SystempromptUserStatusResponse>("GET", "/user/mcp");
  }
}
