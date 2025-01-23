import { jest } from "@jest/globals";
import { main } from "../index";
import { SystemPromptService } from "../services/systemprompt-service";
import { server } from "../server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Mock the server and transport
jest.mock("../server", () => ({
  server: {
    setRequestHandler: jest.fn(),
    connect: jest.fn(),
  },
}));

// Create a mock transport class
const mockTransport = {
  onRequest: jest.fn(),
  onNotification: jest.fn(),
};

jest.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: jest.fn().mockImplementation(() => mockTransport),
}));

// Mock the SystemPromptService
jest.mock("../services/systemprompt-service", () => ({
  SystemPromptService: {
    initialize: jest.fn(),
  },
}));

describe("index", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.SYSTEMPROMPT_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should initialize the server with API key", async () => {
    await main();

    expect(SystemPromptService.initialize).toHaveBeenCalledWith("test-api-key");
  });

  it("should throw error if API key is missing", async () => {
    delete process.env.SYSTEMPROMPT_API_KEY;

    await expect(main()).rejects.toThrow(
      "SYSTEMPROMPT_API_KEY environment variable is required"
    );
  });

  it("should set up request handlers", async () => {
    await main();

    // Verify that setRequestHandler was called for each handler
    expect(server.setRequestHandler).toHaveBeenCalledTimes(7);
  });

  it("should connect to transport", async () => {
    await main();

    expect(StdioServerTransport).toHaveBeenCalled();
    expect(server.connect).toHaveBeenCalled();
    const transport = (server.connect as jest.Mock).mock.calls[0][0];
    expect(transport).toBe(mockTransport);
  });
});
