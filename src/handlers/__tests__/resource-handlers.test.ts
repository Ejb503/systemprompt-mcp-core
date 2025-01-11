import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { BlockService } from "@/services/block-service.js";
import { handleListResources, handleResourceCall } from "../resource-handlers.js";
import { ResourceUriError } from "@/utils/uri-parser.js";
import { ServiceError, ApiError } from "@/utils/error-handling.js";
import type { Block, BlockCreationResult } from "@/types/index.js";

jest.mock("@/services/block-service.js");

describe("Resource Handlers", () => {
  let mockService: jest.Mocked<BlockService>;

  beforeEach(() => {
    jest.clearAllMocks();
    const MockedBlockService = jest.mocked(BlockService);
    mockService = new MockedBlockService() as jest.Mocked<BlockService>;
    mockService.listBlocks = jest.fn();
    mockService.getBlock = jest.fn();
  });

  describe("handleListResources", () => {
    it("should return list of available resources", async () => {
      // Setup
      const mockBlocks: Block[] = [
        {
          id: "block1",
          type: "text",
          content: "Test content 1",
          name: "Test Block 1",
          description: "Test description 1"
        },
        {
          id: "block2",
          type: "code",
          content: "Test content 2",
          name: "Test Block 2",
          description: "Test description 2"
        }
      ];

      mockService.listBlocks.mockResolvedValue(mockBlocks);

      // Execute
      const result = await handleListResources(mockService);

      // Verify
      expect(result).toEqual({
        resources: [
          {
            uri: "resource:///block/block1",
            name: "Test Block 1",
            description: "Test description 1",
            mimeType: "text/plain",
            type: "block",
            blockType: "text"
          },
          {
            uri: "resource:///block/block2",
            name: "Test Block 2",
            description: "Test description 2",
            mimeType: "text/plain",
            type: "block",
            blockType: "code"
          }
        ]
      });
    });

    it("should handle empty list", async () => {
      // Setup
      mockService.listBlocks.mockResolvedValue([]);

      // Execute
      const result = await handleListResources(mockService);

      // Verify
      expect(result.resources).toEqual([]);
    });

    it("should handle API errors", async () => {
      // Setup
      mockService.listBlocks.mockRejectedValue(new ApiError("API request failed: Invalid request"));

      // Execute & Verify
      await expect(handleListResources(mockService)).rejects.toThrow("API request failed: Invalid request");
    });
  });

  describe("handleResourceCall", () => {
    it("should return block content for valid URI", async () => {
      // Setup
      const mockBlock: BlockCreationResult = {
        id: "block1",
        content: "Test content",
        prefix: "test_prefix",
        metadata: {
          title: "Test Block",
          description: "Test description",
          created: "2024-01-01",
          updated: "2024-01-01",
          version: 1,
          status: "draft",
          author: "test",
          log_message: "test message"
        },
        _link: "test-link"
      };

      mockService.getBlock.mockResolvedValue(mockBlock);

      // Execute
      const result = await handleResourceCall(
        {
          params: { uri: "resource:///block/block1" }
        },
        mockService
      );

      // Verify
      expect(result).toEqual({
        contents: [
          {
            uri: "resource:///block/block1",
            mimeType: "text/plain",
            text: "Test content"
          }
        ]
      });
    });

    it("should throw error for invalid URI format", async () => {
      // Execute & Verify
      await expect(
        handleResourceCall(
          {
            params: { uri: "invalid-uri" }
          },
          mockService
        )
      ).rejects.toThrow(ResourceUriError);
    });

    it("should handle API errors", async () => {
      // Setup
      mockService.getBlock.mockRejectedValue(new ApiError("API request failed: Block not found"));

      // Execute & Verify
      await expect(
        handleResourceCall(
          {
            params: { uri: "resource:///block/block1" }
          },
          mockService
        )
      ).rejects.toThrow("API request failed: Block not found");
    });

    it("should handle errors with undefined message", async () => {
      // Setup
      mockService.getBlock.mockRejectedValue(new ServiceError("Unknown error", "fetch block content"));

      // Execute & Verify
      await expect(
        handleResourceCall(
          {
            params: { uri: "resource:///block/block1" }
          },
          mockService
        )
      ).rejects.toThrow("Operation failed: fetch block content. Unknown error");
    });
  });
}); 