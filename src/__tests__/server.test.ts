import { jest } from "@jest/globals";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { server } from "../server";
import { serverConfig, serverCapabilities } from "../config/server-config";

// Mock the Server class
jest.mock("@modelcontextprotocol/sdk/server/index.js", () => ({
  Server: jest.fn(),
}));

describe("server", () => {
  it("should create server with correct config", () => {
    expect(Server).toHaveBeenCalledWith(serverConfig, serverCapabilities);
    expect(server).toBeDefined();
  });
});
