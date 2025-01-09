import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { startServer } from "../index.js";
import { Server } from "@modelcontextprotocol/sdk/server/server.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SystemPromptService } from "../services/systemprompt-service.js";

// Mock the Server and StdioServerTransport
jest.mock("@modelcontextprotocol/sdk/server/server.js", () => ({
  Server: jest.fn().mockImplementation(() => ({
    handle: jest.fn(),
  })),
}));

jest.mock("@modelcontextprotocol/sdk/server/stdio.js", () => {
  return {
    StdioServerTransport: jest.fn().mockImplementation(() => {
      return {
        start: jest.fn().mockImplementation(() => Promise.resolve()),
      };
    }),
  };
});

// Mock console.error to prevent noise in test output
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Mock process.exit to prevent tests from actually exiting
const mockExit = jest
  .spyOn(process, "exit")
  .mockImplementation((code?: string | number | null): never => {
    throw new Error(`Process exited with code ${code}`);
  });

describe("Server", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("startServer", () => {
    it("should initialize services with API key", async () => {
      const mockApiKey = "test-api-key";
      const mockService = new SystemPromptService();
      jest.spyOn(mockService, "initialize");

      const server = await startServer(mockApiKey);

      expect(server).toBeTruthy();
      expect(mockService.initialize).toHaveBeenCalledWith(mockApiKey);
    });

    it("should handle service initialization errors", async () => {
      const mockApiKey = "invalid-api-key";
      const mockService = new SystemPromptService();
      jest.spyOn(mockService, "initialize").mockImplementationOnce(() => {
        throw new Error("Invalid API key");
      });

      await expect(startServer(mockApiKey)).rejects.toThrow();
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("Fatal error")
      );
    });
  });

  describe("main module execution", () => {
    it("should handle missing API key argument", () => {
      // Simulate running as main module without API key
      const oldArgv = process.argv;
      process.argv = ["node", "index.js"];

      require("../index.js");

      expect(mockConsoleError).toHaveBeenCalledWith(
        "API key is required. Usage: systemprompt-agent-server <API_KEY>"
      );
      expect(mockExit).toHaveBeenCalledWith(1);

      process.argv = oldArgv;
    });
  });
});
