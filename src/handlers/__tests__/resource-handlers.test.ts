import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Block } from "../../types/index.js";

// Mock SystemPromptService
const mockListBlocks = jest.fn<() => Promise<Block[]>>();
const mockGetBlock = jest.fn<(blockId: string) => Promise<Block>>();

jest.mock("../../services/systemprompt-service.js", () => ({
  SystemPromptService: jest.fn(() => ({
    listBlocks: mockListBlocks,
    getBlock: mockGetBlock,
  })),
}));

import {
  handleListResources,
  handleResourceCall,
} from "../resource-handlers.js";
import { SystemPromptService } from "../../services/systemprompt-service.js";

describe("Resource Handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleListResources", () => {
    it("should return list of available resources", async () => {
      const mockBlocks: Block[] = [
        {
          id: "block1",
          name: "Test Block 1",
          type: "text",
          description: "Test description 1",
          content: "Test content 1",
        },
        {
          id: "block2",
          name: "Test Block 2",
          type: "code",
          description: "Test description 2",
          content: "Test content 2",
        },
      ];

      mockListBlocks.mockResolvedValueOnce(mockBlocks);

      const result = await handleListResources();

      expect(result).toHaveProperty("resources");
      expect(Array.isArray(result.resources)).toBe(true);
      expect(result.resources).toHaveLength(2);

      expect(result.resources).toEqual([
        {
          uri: "resource:///block/block1",
          mimeType: "text/plain",
          name: "Test Block 1",
          description: "Test description 1",
        },
        {
          uri: "resource:///block/block2",
          mimeType: "text/plain",
          name: "Test Block 2",
          description: "Test description 2",
        },
      ]);
    });

    it("should handle API errors", async () => {
      mockListBlocks.mockRejectedValueOnce(new Error("API request failed"));

      await expect(handleListResources()).rejects.toThrow(
        "Failed to fetch blocks: API request failed"
      );
    });

    it("should handle blocks without description", async () => {
      const mockBlocks: Block[] = [
        {
          id: "block1",
          name: "Test Block 1",
          type: "text",
          content: "Test content 1",
        } as Block,
      ];

      mockListBlocks.mockResolvedValueOnce(mockBlocks);

      const result = await handleListResources();

      expect(result.resources[0].description).toBe("text block: Test Block 1");
    });
  });

  describe("handleResourceCall", () => {
    it("should return block content", async () => {
      const mockBlock: Block = {
        id: "block1",
        content: "Test block content",
        name: "Test Block",
        type: "text",
        description: "Test description",
      };

      mockGetBlock.mockResolvedValueOnce(mockBlock);

      const result = await handleResourceCall({
        params: { uri: "resource:///block/block1" },
      });

      expect(mockGetBlock).toHaveBeenCalledWith("block1");
      expect(result).toEqual({
        contents: [
          {
            uri: "resource:///block/block1",
            mimeType: "text/plain",
            text: "Test block content",
          },
        ],
      });
    });

    it("should throw error for invalid URI format", async () => {
      await expect(
        handleResourceCall({
          params: { uri: "resource:///invalid" },
        })
      ).rejects.toThrow(
        "Invalid resource URI format - expected resource:///block/{id}"
      );
    });

    it("should handle API errors", async () => {
      mockGetBlock.mockRejectedValueOnce(new Error("API request failed"));

      await expect(
        handleResourceCall({
          params: { uri: "resource:///block/block1" },
        })
      ).rejects.toThrow("Failed to fetch block content: API request failed");
    });

    it("should handle errors with undefined message", async () => {
      const errorWithoutMessage = new Error();
      mockGetBlock.mockRejectedValueOnce(errorWithoutMessage);

      await expect(
        handleResourceCall({
          params: { uri: "resource:///block/block1" },
        })
      ).rejects.toThrow("Failed to fetch block content: Unknown error");
    });
  });
});
