import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import {
  SystemPromptService,
  initializeService,
} from "../systemprompt-service.js";

describe("SystemPromptService", () => {
  let service: SystemPromptService;
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    // Reset the module state
    jest.resetModules();
    // Reset the service before each test
    service = new SystemPromptService();
    service.initialize(mockApiKey);
  });

  describe("initialization", () => {
    beforeEach(() => {
      global.fetch = jest.fn() as unknown as typeof fetch;
    });

    it("should initialize with API key", () => {
      expect(() => service.initialize(mockApiKey)).not.toThrow();
    });

    it("should throw error when not initialized", async () => {
      await jest.isolateModules(async () => {
        const { SystemPromptService } = await import(
          "../systemprompt-service.js"
        );
        const uninitializedService = new SystemPromptService();
        await expect(uninitializedService.getPrompt("test-id")).rejects.toThrow(
          "Service not initialized"
        );
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe("API requests", () => {
    beforeEach(() => {
      // Mock fetch globally
      global.fetch = jest.fn() as jest.Mocked<typeof fetch>;
    });

    it("should make GET request", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      } as Response;
      (global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve(mockResponse)
      );

      const result = await service["request"]("/test");
      expect(result).toEqual({ data: "test" });
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.systemprompt.io/v1/test",
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "api-key": mockApiKey,
          },
        })
      );
    });

    it("should make POST request with data", async () => {
      const testData = { test: "data" };
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      } as Response;
      (global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve(mockResponse)
      );

      const result = await service["request"]("/test", "POST", testData);
      expect(result).toEqual({ data: "test" });
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.systemprompt.io/v1/test",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": mockApiKey,
          },
          body: JSON.stringify(testData),
        })
      );
    });

    it("should handle API errors", async () => {
      const mockResponse = {
        ok: false,
        statusText: "Not Found",
      } as Response;
      (global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve(mockResponse)
      );

      await expect(service["request"]("/test")).rejects.toThrow(
        "API request failed: Not Found"
      );
    });
  });
});
