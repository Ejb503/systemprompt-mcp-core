import { validateToolRequest, getToolSchema } from "../tool-validation";
import { TOOLS } from "../../constants/tools";
import type { CallToolRequest, Tool } from "@modelcontextprotocol/sdk/types.js";
import type { JSONSchema7 } from "json-schema";

// Mock the tools constant
jest.mock("../../constants/tools", () => ({
  TOOLS: [
    {
      name: "test_tool",
      description: "A test tool",
      inputSchema: {
        type: "object",
        properties: {
          test: { type: "string" },
        },
        required: ["test"],
      },
    },
    {
      name: "simple_tool",
      description: "A simple tool without schema",
    },
  ],
}));

describe("tool-validation", () => {
  describe("validateToolRequest", () => {
    it("should validate a tool request with valid parameters", () => {
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "test_tool",
          arguments: {
            test: "value",
          },
        },
      };

      const result = validateToolRequest(request);
      expect(result).toBeDefined();
      expect(result.name).toBe("test_tool");
    });

    it("should validate a tool request without schema", () => {
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "simple_tool",
          arguments: {},
        },
      };

      const result = validateToolRequest(request);
      expect(result).toBeDefined();
      expect(result.name).toBe("simple_tool");
    });

    it("should throw error for missing tool name", () => {
      const request = {
        method: "tools/call",
        params: {
          arguments: {},
        },
      } as CallToolRequest;

      expect(() => validateToolRequest(request)).toThrow(
        "Invalid tool request: missing tool name"
      );
    });

    it("should throw error for unknown tool", () => {
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "unknown_tool",
          arguments: {},
        },
      };

      expect(() => validateToolRequest(request)).toThrow(
        "Unknown tool: unknown_tool"
      );
    });

    it("should throw error for invalid arguments", () => {
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "test_tool",
          arguments: {
            wrong: "value", // Missing required 'test' field
          },
        },
      };

      expect(() => validateToolRequest(request)).toThrow();
    });
  });

  describe("getToolSchema", () => {
    it("should return schema for tool with schema", () => {
      const schema = getToolSchema("test_tool");
      expect(schema).toBeDefined();
      expect(schema?.type).toBe("object");
      expect(schema?.properties?.test).toBeDefined();
    });

    it("should return undefined for tool without schema", () => {
      const schema = getToolSchema("simple_tool");
      expect(schema).toBeUndefined();
    });

    it("should return undefined for unknown tool", () => {
      const schema = getToolSchema("unknown_tool");
      expect(schema).toBeUndefined();
    });
  });
});
