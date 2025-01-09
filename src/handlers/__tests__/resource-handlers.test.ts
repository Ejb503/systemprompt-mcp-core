import { jest } from "@jest/globals";
import { SystemPromptService } from "../../services/systemprompt-service.js";
import {
  handleListResources,
  handleResourceCall,
} from "../resource-handlers.js";
import { SystempromptBlockResponse } from "../../types/index.js";

jest.mock("../../services/systemprompt-service.js");

describe("Resource Handlers", () => {
  const mockInstance = {
    listBlocks: jest.fn<() => Promise<SystempromptBlockResponse[]>>(),
    getBlock: jest.fn<() => Promise<SystempromptBlockResponse>>(),
    getAllPrompts: jest.fn(),
    getPrompt: jest.fn(),
    createPrompt: jest.fn(),
    editPrompt: jest.fn(),
    createBlock: jest.fn(),
    editBlock: jest.fn(),
    deleteBlock: jest.fn(),
    deletePrompt: jest.fn(),
    request: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    SystemPromptService.initialize("test-api-key");
    jest
      .spyOn(SystemPromptService, "getInstance")
      .mockReturnValue(mockInstance as unknown as SystemPromptService);
  });

  describe("handleListResources", () => {
    it("should list resources", async () => {
      const mockBlocks: SystempromptBlockResponse[] = [
        {
          id: "block1",
          content: "Test content 1",
          prefix: "",
          metadata: {
            title: "Test Block 1",
            description: "Test description 1",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1,
            status: "draft",
            author: "test",
            log_message: "Created",
          },
        },
        {
          id: "block2",
          content: "Test content 2",
          prefix: "",
          metadata: {
            title: "Test Block 2",
            description: "Test description 2",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1,
            status: "draft",
            author: "test",
            log_message: "Created",
          },
        },
      ];

      mockInstance.listBlocks.mockResolvedValue(mockBlocks);

      const result = await handleListResources({
        method: "resources/list",
      });

      expect(result.resources).toEqual(
        mockBlocks.map((block) => ({
          uri: block.id,
          name: block.metadata.title,
          description: block.metadata.description,
          mimeType: "text/plain",
        }))
      );
    });

    it("should handle errors when listing resources", async () => {
      const error = new Error("Test error");
      mockInstance.listBlocks.mockRejectedValue(error);

      await expect(
        handleListResources({
          method: "resources/list",
        })
      ).rejects.toThrow(
        "Failed to fetch blocks from systemprompt.io: Test error"
      );
    });

    it("should handle null description in resources", async () => {
      const mockBlocksWithNullDesc: SystempromptBlockResponse[] = [
        {
          id: "block1",
          content: "Test content 1",
          prefix: "",
          metadata: {
            title: "Test Block 1",
            description: null,
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1,
            status: "draft",
            author: "test",
            log_message: "Created",
          },
        },
      ];

      mockInstance.listBlocks.mockResolvedValue(mockBlocksWithNullDesc);

      const result = await handleListResources({
        method: "resources/list",
      });

      expect(result.resources[0].description).toBeUndefined();
    });
  });

  describe("handleResourceCall", () => {
    it("should get a resource by URI", async () => {
      const mockBlock: SystempromptBlockResponse = {
        id: "block1",
        content: "Test content",
        prefix: "",
        metadata: {
          title: "Test Block",
          description: "Test description",
          created: "2024-01-01",
          updated: "2024-01-01",
          version: 1,
          status: "draft",
          author: "test",
          log_message: "Created",
        },
      };

      mockInstance.getBlock.mockResolvedValue(mockBlock);

      const result = await handleResourceCall({
        method: "resources/read",
        params: {
          uri: "resource:///block/block1",
        },
      });

      expect(result.contents[0]).toEqual({
        uri: mockBlock.id,
        mimeType: "text/plain",
        text: mockBlock.content,
      });
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

    it("should handle API errors", async () => {
      mockInstance.getBlock.mockRejectedValue(new Error("API error"));

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

    it("should handle missing block", async () => {
      mockInstance.getBlock.mockRejectedValue(new Error());

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
