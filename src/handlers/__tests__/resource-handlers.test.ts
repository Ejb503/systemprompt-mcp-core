import { jest } from "@jest/globals";
import { SystemPromptService } from "../../services/systemprompt-service.js";
import {
  handleListResources,
  handleResourceCall,
  initializeService,
} from "../resource-handlers.js";
import type { Block } from "../../types/index.js";

jest.mock("../../services/systemprompt-service.js");

describe("Resource Handlers", () => {
  const mockSystemPromptService = {
    baseUrl: "https://api.systemprompt.io/v1",
    listblock: jest.fn<() => Promise<Block[]>>(),
    getBlock: jest.fn<(blockId: string) => Promise<Block>>(),
    getAllprompt: jest.fn(),
    createPrompt: jest.fn(),
    editPrompt: jest.fn(),
    createBlock: jest.fn(),
    updateBlock: jest.fn(),
    deleteBlock: jest.fn(),
    updatePrompt: jest.fn(),
    deletePrompt: jest.fn(),
    request: jest.fn(),
    initialize: jest.fn(),
  } as unknown as jest.Mocked<SystemPromptService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (
      SystemPromptService as jest.MockedClass<typeof SystemPromptService>
    ).mockImplementation(
      () =>
        mockSystemPromptService as unknown as jest.Mocked<SystemPromptService>
    );
    initializeService("test-api-key");
  });

  describe("handleListResources", () => {
    it("should list resources", async () => {
      const mockBlocks: Block[] = [
        {
          id: "block1",
          content: "Test content 1",
          metadata: {
            title: "Test Block 1",
            description: "Test description 1",
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-01T00:00:00Z",
            version: 1,
            status: "draft",
            author: "test",
            log_message: "Initial creation",
          },
          _link: "test-link-1",
        },
        {
          id: "block2",
          content: "Test content 2",
          metadata: {
            title: "Test Block 2",
            description: "Test description 2",
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-01T00:00:00Z",
            version: 1,
            status: "draft",
            author: "test",
            log_message: "Initial creation",
          },
          _link: "test-link-2",
        },
      ];

      mockSystemPromptService.listblock.mockResolvedValue(mockBlocks);

      const result = await handleListResources({
        method: "resources/list",
      });

      expect(result.resources).toEqual(
        mockBlocks.map((block) => ({
          uri: `resource:///block/${block.id}`,
          name: block.metadata.title,
          description: block.metadata.description,
          mimeType: "text/plain",
        }))
      );
    });

    it("should handle errors when listing resources", async () => {
      const error = new Error("Test error");
      mockSystemPromptService.listblock.mockRejectedValue(error);

      await expect(
        handleListResources({
          method: "resources/list",
        })
      ).rejects.toThrow("Failed to list resources: Error: Test error");
    });
  });

  describe("handleResourceCall", () => {
    it("should get a resource by URI", async () => {
      const mockBlock: Block = {
        id: "block1",
        content: "Test content",
        metadata: {
          title: "Test Block",
          description: "Test description",
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
          version: 1,
          status: "draft",
          author: "test",
          log_message: "Initial creation",
        },
        _link: "test-link-1",
      };

      mockSystemPromptService.getBlock.mockResolvedValue(mockBlock);

      const result = await handleResourceCall({
        method: "resources/read",
        params: {
          uri: "resource:///block/block1",
        },
      });

      expect(result.contents[0]).toEqual({
        uri: "resource:///block/block1",
        mimeType: "text/plain",
        text: mockBlock.content,
        metadata: {
          id: mockBlock.id,
          type: "block",
          name: mockBlock.metadata.title,
          description: mockBlock.metadata.description,
        },
      });
    });

    it("should throw error for invalid URI format", async () => {
      await expect(
        handleResourceCall({
          method: "resources/read",
          params: {
            uri: "invalid-uri-format",
          },
        })
      ).rejects.toThrow(
        "Invalid resource URI format - expected resource:///block/{id}"
      );
    });

    it("should handle errors when fetching block", async () => {
      mockSystemPromptService.getBlock.mockRejectedValue(
        new Error("API error")
      );

      await expect(
        handleResourceCall({
          method: "resources/read",
          params: {
            uri: "resource:///block/block1",
          },
        })
      ).rejects.toThrow(
        "Failed to fetch block from systemprompt.io: API error"
      );
    });

    it("should handle errors without message when fetching block", async () => {
      const errorWithoutMessage = new Error();
      errorWithoutMessage.message = "";
      mockSystemPromptService.getBlock.mockRejectedValue(errorWithoutMessage);

      await expect(
        handleResourceCall({
          method: "resources/read",
          params: {
            uri: "resource:///block/block1",
          },
        })
      ).rejects.toThrow(
        "Failed to fetch block from systemprompt.io: Unknown error"
      );
    });
  });
});
