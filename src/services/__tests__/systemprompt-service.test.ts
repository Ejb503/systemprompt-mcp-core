import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { SystemPromptService } from "../systemprompt-service";
import type { CreatePromptInput, CreateBlockInput } from "../../types/index";

// Mock fetch
const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(""),
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

global.fetch = mockFetch as unknown as typeof fetch;

describe("SystemPromptService", () => {
  let service: SystemPromptService;
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SYSTEMPROMPT_API_KEY = mockApiKey;
    service = new SystemPromptService();
  });

  afterEach(() => {
    delete process.env.SYSTEMPROMPT_API_KEY;
  });

  describe("createPrompt", () => {
    const validPromptData: CreatePromptInput = {
      instruction: {
        static: "Test instruction",
        state: "Test state",
        dynamic: "Test dynamic",
      },
      input: {
        name: "test_input",
        description: "Test input description",
        type: ["message"],
      },
      output: {
        name: "test_output",
        description: "Test output description",
        type: ["message"],
      },
      metadata: {
        title: "Test prompt",
        description: "Test description",
        tag: ["test"],
      },
    };

    it("should create a prompt successfully", async () => {
      const mockResponse = {
        id: "test-uuid",
        ...validPromptData,
        _link: "test-link",
        metadata: {
          ...validPromptData.metadata,
          created: "2024-01-01",
          updated: "2024-01-01",
          version: 1,
          status: "draft" as const,
          author: "test",
          log_message: "Created",
        },
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await service.createPrompt(validPromptData);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.systemprompt.io/v1/prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": mockApiKey,
          },
          body: JSON.stringify(validPromptData),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors", async () => {
      const errorMessage = "Invalid input";
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: errorMessage }),
        })
      );

      await expect(service.createPrompt(validPromptData)).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe("editPrompt", () => {
    const uuid = "test-uuid";
    const updateData = {
      instruction: {
        static: "Updated instruction",
      },
      metadata: {
        title: "Updated title",
        description: "Test description",
      },
    };

    it("should edit a prompt successfully", async () => {
      const mockResponse = {
        id: uuid,
        instruction: { static: "Updated instruction" },
        input: {
          name: "test_input",
          description: "Test input description",
          type: ["message" as const],
        },
        output: {
          name: "test_output",
          description: "Test output description",
          type: ["message" as const],
        },
        metadata: {
          title: "Updated title",
          description: "Test description",
          created: "2024-01-01",
          updated: "2024-01-01",
          version: 1,
          status: "draft" as const,
          author: "test",
          log_message: "Updated",
        },
        _link: "test-link",
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await service.editPrompt(uuid, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.systemprompt.io/v1/prompt/${uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "api-key": mockApiKey,
          },
          body: JSON.stringify(updateData),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors", async () => {
      const errorMessage = "Prompt not found";
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: errorMessage }),
        })
      );

      await expect(service.editPrompt(uuid, updateData)).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe("createBlock", () => {
    const validBlockData: CreateBlockInput = {
      content: "Test block content",
      prefix: "test_block",
      metadata: {
        title: "Test block",
        description: "Test description",
        tag: ["test"],
      },
    };

    it("should create a block successfully", async () => {
      const mockResponse = {
        id: "test-uuid",
        ...validBlockData,
        _link: "test-link",
        metadata: {
          ...validBlockData.metadata,
          created: "2024-01-01",
          updated: "2024-01-01",
          version: 1,
          status: "draft" as const,
          author: "test",
          log_message: "Created",
        },
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await service.createBlock(validBlockData);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.systemprompt.io/v1/block",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": mockApiKey,
          },
          body: JSON.stringify(validBlockData),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors", async () => {
      const errorMessage = "Invalid input";
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: errorMessage }),
        })
      );

      await expect(service.createBlock(validBlockData)).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe("editBlock", () => {
    const uuid = "test-uuid";
    const updateData = {
      content: "Updated content",
      metadata: {
        title: "Updated title",
        description: "Test description",
      },
    };

    it("should edit a block successfully", async () => {
      const mockResponse = {
        id: uuid,
        content: "Updated content",
        metadata: {
          title: "Updated title",
          description: "Test description",
          created: "2024-01-01",
          updated: "2024-01-01",
          version: 1,
          status: "draft" as const,
          author: "test",
          log_message: "Updated",
        },
        _link: "test-link",
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await service.editBlock(uuid, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.systemprompt.io/v1/block/${uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "api-key": mockApiKey,
          },
          body: JSON.stringify(updateData),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors", async () => {
      const errorMessage = "Block not found";
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: errorMessage }),
        })
      );

      await expect(service.editBlock(uuid, updateData)).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe("error handling", () => {
    it("should handle network errors", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Network error"))
      );

      await expect(service.createPrompt({} as any)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle invalid JSON responses", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.reject(new Error("Invalid JSON")),
        })
      );

      await expect(service.createPrompt({} as any)).rejects.toThrow(
        "API request failed"
      );
    });

    it("should handle missing API key", () => {
      delete process.env.SYSTEMPROMPT_API_KEY;
      const service = new SystemPromptService();
      expect(service["apiKey"]).toBe("");
    });

    it("should handle non-JSON responses", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error("Invalid JSON")),
        })
      );

      await expect(service.getAllPrompts()).rejects.toThrow(
        "API request failed"
      );
    });

    it("should handle network errors without message", async () => {
      mockFetch.mockImplementationOnce(() => Promise.reject({}));

      await expect(service.getAllPrompts()).rejects.toThrow(
        "API request failed"
      );
    });

    it("should handle API errors without message", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      );

      await expect(service.getAllPrompts()).rejects.toThrow(
        "API request failed"
      );
    });
  });

  describe("listBlocks", () => {
    it("should return list of blocks", async () => {
      const mockBlocks = [
        {
          id: "test-id",
          name: "test-block",
          type: "test",
          content: "test content",
          description: "test description",
        },
      ];

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBlocks),
        })
      );

      const result = await service.listBlocks();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.systemprompt.io/v1/block",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "api-key": mockApiKey,
          },
        }
      );

      expect(result).toEqual(mockBlocks);
    });

    it("should handle API errors", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: "Failed to list blocks" }),
        })
      );

      await expect(service.listBlocks()).rejects.toThrow(
        "Failed to list blocks"
      );
    });
  });

  describe("getBlock", () => {
    const blockId = "test-id";

    it("should return a specific block", async () => {
      const mockBlock = {
        id: blockId,
        name: "test-block",
        type: "test",
        content: "test content",
        description: "test description",
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBlock),
        })
      );

      const result = await service.getBlock(blockId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.systemprompt.io/v1/block/${blockId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "api-key": mockApiKey,
          },
        }
      );

      expect(result).toEqual(mockBlock);
    });

    it("should handle API errors", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: "Block not found" }),
        })
      );

      await expect(service.getBlock(blockId)).rejects.toThrow(
        "Block not found"
      );
    });
  });
});
