import { jest, describe, it, expect } from "@jest/globals";
import type { Block, CreatePromptInput, PromptCreationResult, EditPromptInput } from "@/types/index.js";
import { handleListResources, handleResourceCall, type ResourceCallRequest } from "../resource-handlers.js";
import { SystemPromptService } from "@/services/systemprompt-service.js";

// Create a complete mock service that implements all required methods
const createMockService = (overrides: Partial<SystemPromptService> = {}): jest.Mocked<SystemPromptService> => {
  const mockService = {
    getAllPrompts: jest.fn<() => Promise<PromptCreationResult[]>>().mockResolvedValue([]),
    createPrompt: jest.fn<(data: CreatePromptInput) => Promise<PromptCreationResult>>().mockResolvedValue({} as PromptCreationResult),
    editPrompt: jest.fn<(uuid: string, data: EditPromptInput) => Promise<PromptCreationResult>>().mockResolvedValue({} as PromptCreationResult),
    listBlocks: jest.fn<() => Promise<Block[]>>().mockResolvedValue([]),
    getBlock: jest.fn<(blockId: string) => Promise<Block>>().mockResolvedValue({} as Block),
    createBlock: jest.fn<(data: any) => Promise<Block>>().mockResolvedValue({} as Block),
    editBlock: jest.fn<(blockId: string, data: any) => Promise<Block>>().mockResolvedValue({} as Block),
    ...overrides
  };

  return mockService as jest.Mocked<SystemPromptService>;
};

describe("Resource Handlers", () => {
  describe("handleListResources", () => {
    it("should return list of available resources", async () => {
      // Setup
      const mockBlocks: Block[] = [
        {
          id: "block1",
          name: "Test Block 1",
          type: "text",
          description: "Test description 1",
          content: "Test content 1"
        },
        {
          id: "block2",
          name: "Test Block 2",
          type: "code",
          description: "Test description 2",
          content: "Test content 2"
        }
      ];

      const mockService = createMockService({
        listBlocks: jest.fn<() => Promise<Block[]>>().mockResolvedValue(mockBlocks)
      });

      // Execute
      const result = await handleListResources(mockService);

      // Verify
      expect(result).toEqual({
        resources: [
          {
            uri: "resource:///block/block1",
            mimeType: "text/plain",
            name: "Test Block 1",
            description: "Test description 1"
          },
          {
            uri: "resource:///block/block2",
            mimeType: "text/plain",
            name: "Test Block 2",
            description: "Test description 2"
          }
        ]
      });
    });

    it("should handle empty block list", async () => {
      // Setup
      const mockService = createMockService({
        listBlocks: jest.fn<() => Promise<Block[]>>().mockResolvedValue([])
      });

      // Execute
      const result = await handleListResources(mockService);

      // Verify
      expect(result.resources).toEqual([]);
    });

    it("should handle blocks without description", async () => {
      // Setup
      const mockBlocks: Block[] = [
        {
          id: "block1",
          name: "Test Block 1",
          type: "text",
          content: "Test content 1"
        } as Block
      ];

      const mockService = createMockService({
        listBlocks: jest.fn<() => Promise<Block[]>>().mockResolvedValue(mockBlocks)
      });

      // Execute
      const result = await handleListResources(mockService);

      // Verify
      expect(result.resources[0].description).toBe("text block: Test Block 1");
    });

    it("should handle API errors", async () => {
      // Setup
      const mockService = createMockService({
        listBlocks: jest.fn<() => Promise<Block[]>>().mockRejectedValue(new Error("API request failed"))
      });

      // Execute & Verify
      await expect(handleListResources(mockService)).rejects.toThrow(
        "Failed to fetch blocks: API request failed"
      );
    });
  });

  describe("handleResourceCall", () => {
    it("should return block content", async () => {
      // Setup
      const mockBlock: Block = {
        id: "block1",
        name: "Test Block",
        type: "text",
        description: "Test description",
        content: "Test content"
      };

      const mockService = createMockService({
        getBlock: jest.fn<(blockId: string) => Promise<Block>>().mockResolvedValue(mockBlock)
      });

      const request: ResourceCallRequest = {
        params: { uri: "resource:///block/block1" }
      };

      // Execute
      const result = await handleResourceCall(request, mockService);

      // Verify
      expect(mockService.getBlock).toHaveBeenCalledWith("block1");
      expect(result).toEqual({
        contents: [
          {
            uri: "resource:///block/block1",
            mimeType: "text/plain",
            text: mockBlock.content
          }
        ]
      });
    });

    it("should throw error for invalid URI format", async () => {
      // Setup
      const mockService = createMockService();

      // Execute & Verify
      await expect(
        handleResourceCall({
          params: { uri: "invalid-uri" }
        }, mockService)
      ).rejects.toThrow("Invalid resource URI format - expected resource:///block/{id}");
    });

    it("should handle API errors", async () => {
      // Setup
      const mockService = createMockService({
        getBlock: jest.fn<(blockId: string) => Promise<Block>>().mockRejectedValue(new Error("API request failed"))
      });

      // Execute & Verify
      await expect(
        handleResourceCall({
          params: { uri: "resource:///block/block1" }
        }, mockService)
      ).rejects.toThrow("Failed to fetch block content: API request failed");
    });

    it("should handle errors with undefined message", async () => {
      // Setup
      const error = new Error();
      error.message = undefined as any;
      
      const mockService = createMockService({
        getBlock: jest.fn<(blockId: string) => Promise<Block>>().mockRejectedValue(error)
      });

      // Execute & Verify
      await expect(
        handleResourceCall({
          params: { uri: "resource:///block/block1" }
        }, mockService)
      ).rejects.toThrow("Failed to fetch block content: Unknown error");
    });
  });
}); 