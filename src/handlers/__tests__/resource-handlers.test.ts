import { jest } from "@jest/globals";
import {
  handleListResources,
  handleResourceCall,
} from "../resource-handlers.js";
import { SystemPromptService } from "../../services/systemprompt-service.js";
import MockSystemPromptService from "../../__mocks__/systemprompt-service.js";

jest.mock("../../services/systemprompt-service.js", () => {
  return {
    SystemPromptService: {
      initialize: (apiKey: string) => {
        const instance = MockSystemPromptService.getInstance();
        instance.initialize(apiKey);
      },
      getInstance: () => MockSystemPromptService.getInstance(),
      cleanup: () => {
        // No cleanup needed for mock
      },
    },
  };
});

describe("Resource Handlers", () => {
  beforeAll(() => {
    SystemPromptService.initialize("test-api-key");
  });

  afterAll(() => {
    SystemPromptService.cleanup();
  });

  describe("handleListResources", () => {
    it("should list the default agent resource", async () => {
      const result = await handleListResources({
        method: "resources/list",
      });

      expect(result.resources).toEqual([
        {
          uri: "resource:///block/default",
          name: "Systemprompt Agent",
          description:
            "An expert agent for managing and organizing content in workspaces",
          mimeType: "text/plain",
        },
      ]);
      expect(result._meta).toEqual({});
    });

    it("should handle service errors with messages", async () => {
      const mockError = new Error("Service unavailable");
      const mockListBlocks = jest.fn(() => Promise.reject(mockError));
      const mockGetInstance = jest.fn(
        () =>
          ({
            listBlocks: mockListBlocks,
          } as unknown as SystemPromptService)
      );

      jest
        .spyOn(SystemPromptService, "getInstance")
        .mockImplementation(mockGetInstance);

      await expect(
        handleListResources({ method: "resources/list" })
      ).rejects.toThrow(
        "Failed to fetch blocks from systemprompt.io: Service unavailable"
      );

      jest.restoreAllMocks();
    });

    it("should handle service errors without messages", async () => {
      const mockError = new Error();
      const mockListBlocks = jest.fn(() => Promise.reject(mockError));
      const mockGetInstance = jest.fn(
        () =>
          ({
            listBlocks: mockListBlocks,
          } as unknown as SystemPromptService)
      );

      jest
        .spyOn(SystemPromptService, "getInstance")
        .mockImplementation(mockGetInstance);

      await expect(
        handleListResources({ method: "resources/list" })
      ).rejects.toThrow(
        "Failed to fetch blocks from systemprompt.io: Unknown error"
      );

      jest.restoreAllMocks();
    });
  });

  describe("handleResourceCall", () => {
    it("should get the default agent resource", async () => {
      const result = await handleResourceCall({
        method: "resources/read",
        params: {
          uri: "resource:///block/default",
        },
      });

      const parsedContent = JSON.parse(result.contents[0].text as string) as {
        name: string;
        description: string;
        instruction: string;
        voice: string;
        config: {
          model: string;
          generationConfig: {
            responseModalities: string;
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: string;
                };
              };
            };
          };
        };
      };

      expect(result.contents[0].uri).toBe("resource:///block/default");
      expect(result.contents[0].mimeType).toBe("text/plain");
      expect(parsedContent).toEqual({
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
      });
      expect(result._meta).toEqual({});
    });

    it("should handle invalid URI format", async () => {
      await expect(
        handleResourceCall({
          method: "resources/read",
          params: {
            uri: "invalid-uri",
          },
        })
      ).rejects.toThrow(
        "Invalid resource URI format - expected resource:///block/{id}"
      );
    });

    it("should handle non-default resource request", async () => {
      await expect(
        handleResourceCall({
          method: "resources/read",
          params: {
            uri: "resource:///block/nonexistent",
          },
        })
      ).rejects.toThrow(
        "Failed to fetch block from systemprompt.io: Resource not found"
      );
    });

    it("should handle service errors with messages", async () => {
      const mockError = new Error("Service unavailable");
      const mockGetBlock = jest.fn(() => Promise.reject(mockError));
      const mockGetInstance = jest.fn(
        () =>
          ({
            getBlock: mockGetBlock,
          } as unknown as SystemPromptService)
      );

      jest
        .spyOn(SystemPromptService, "getInstance")
        .mockImplementation(mockGetInstance);

      await expect(
        handleResourceCall({
          method: "resources/read",
          params: { uri: "resource:///block/test" },
        })
      ).rejects.toThrow(
        "Failed to fetch block from systemprompt.io: Service unavailable"
      );

      jest.restoreAllMocks();
    });

    it("should handle service errors without messages", async () => {
      const mockError = new Error();
      const mockGetBlock = jest.fn(() => Promise.reject(mockError));
      const mockGetInstance = jest.fn(
        () =>
          ({
            getBlock: mockGetBlock,
          } as unknown as SystemPromptService)
      );

      jest
        .spyOn(SystemPromptService, "getInstance")
        .mockImplementation(mockGetInstance);

      await expect(
        handleResourceCall({
          method: "resources/read",
          params: { uri: "resource:///block/test" },
        })
      ).rejects.toThrow(
        "Failed to fetch block from systemprompt.io: Unknown error"
      );

      jest.restoreAllMocks();
    });
  });
});
