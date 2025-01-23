import type { SystempromptBlockResponse } from "../types/systemprompt.js";

class MockSystemPromptService {
  private static instance: MockSystemPromptService;
  private initialized = false;
  private apiKey: string | null = null;

  private constructor() {}

  public static getInstance(): MockSystemPromptService {
    if (!MockSystemPromptService.instance) {
      MockSystemPromptService.instance = new MockSystemPromptService();
    }
    return MockSystemPromptService.instance;
  }

  public initialize(apiKey: string): void {
    this.apiKey = apiKey;
    this.initialized = true;
  }

  private checkInitialized(): void {
    if (!this.initialized || !this.apiKey) {
      throw new Error(
        "SystemPromptService must be initialized with an API key first"
      );
    }
  }

  public async listBlocks(): Promise<SystempromptBlockResponse[]> {
    this.checkInitialized();
    return [
      {
        id: "default",
        content: JSON.stringify({
          name: "Systemprompt Agent",
          description:
            "An expert agent for managing and organizing content in workspaces",
          instruction: "You are a specialized agent",
          voice: "Kore",
          config: {
            model: "models/gemini-2.0-flash-exp",
            generationConfig: {
              responseModalities: "audio",
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Kore",
                  },
                },
              },
            },
          },
        }),
        metadata: {
          title: "Systemprompt Agent",
          description:
            "An expert agent for managing and organizing content in workspaces",
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          version: 1,
          status: "active",
          author: "system",
          log_message: "Initial version",
          tag: ["agent"],
        },
        prefix: "",
      },
    ];
  }

  public async getBlock(id: string): Promise<SystempromptBlockResponse> {
    this.checkInitialized();
    if (id === "default") {
      return {
        id: "default",
        content: JSON.stringify({
          name: "Systemprompt Agent",
          description:
            "An expert agent for managing and organizing content in workspaces",
          instruction: "You are a specialized agent",
          voice: "Kore",
          config: {
            model: "models/gemini-2.0-flash-exp",
            generationConfig: {
              responseModalities: "audio",
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Kore",
                  },
                },
              },
            },
          },
        }),
        metadata: {
          title: "Systemprompt Agent",
          description:
            "An expert agent for managing and organizing content in workspaces",
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          version: 1,
          status: "active",
          author: "system",
          log_message: "Initial version",
          tag: ["agent"],
        },
        prefix: "",
      };
    }
    throw new Error("Resource not found");
  }
}

export default MockSystemPromptService;
