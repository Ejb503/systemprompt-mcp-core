import {
  mapPromptToGetPromptResult,
  mapPromptsToListPromptsResult,
  mapBlockToReadResourceResult,
  mapBlocksToListResourcesResult,
} from "../mcp-mappers.js";
import {
  mockSystemPromptResult,
  mockArrayPromptResult,
  mockNestedPromptResult,
} from "../../__tests__/mock-objects.js";
import type {
  SystempromptPromptResponse,
  SystempromptBlockResponse,
} from "../../types/systemprompt.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";

describe("MCP Mappers", () => {
  describe("mapPromptToGetPromptResult", () => {
    it("should map a prompt with all fields", () => {
      const prompt: SystempromptPromptResponse = {
        id: "test-prompt",
        metadata: {
          title: "Test Prompt",
          description: "Test Description",
          created: "2024-01-01",
          updated: "2024-01-01",
          version: 1,
          status: "active",
          author: "test",
          log_message: "Initial version",
          tag: ["test"],
        },
        instruction: {
          static: "Test instruction",
          dynamic: "",
          state: "",
        },
        input: {
          name: "test-input",
          description: "Test input",
          type: ["object"],
          schema: {
            type: "object",
            properties: {
              testArg: {
                type: "string",
                description: "Test argument",
              },
              requiredArg: {
                type: "string",
                description: "Required argument",
              },
            },
            required: ["requiredArg"],
          },
        },
        output: {
          name: "test-output",
          description: "Test output",
          type: ["object"],
          schema: {
            type: "object",
            properties: {},
          },
        },
        _link: "test-link",
      };

      const result = mapPromptToGetPromptResult(prompt);

      expect(result).toEqual({
        name: "Test Prompt",
        description: "Test Description",
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: "Test instruction",
            },
          },
        ],
        arguments: [
          {
            name: "testArg",
            description: "Test argument",
            required: false,
          },
          {
            name: "requiredArg",
            description: "Required argument",
            required: true,
          },
        ],
        tools: [],
        _meta: { prompt },
      });
    });

    it("should handle missing optional fields", () => {
      const prompt: SystempromptPromptResponse = {
        id: "test-prompt-2",
        metadata: {
          title: "Test Prompt",
          description: "Test Description",
          created: "2024-01-01",
          updated: "2024-01-01",
          version: 1,
          status: "active",
          author: "test",
          log_message: "Initial version",
          tag: ["test"],
        },
        instruction: {
          static: "Test instruction",
          dynamic: "",
          state: "",
        },
        input: {
          name: "test-input",
          description: "Test input",
          type: ["object"],
          schema: {
            type: "object",
            properties: {},
          },
        },
        output: {
          name: "test-output",
          description: "Test output",
          type: ["object"],
          schema: {
            type: "object",
            properties: {},
          },
        },
        _link: "test-link",
      };

      const result = mapPromptToGetPromptResult(prompt);

      expect(result).toEqual({
        name: "Test Prompt",
        description: "Test Description",
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: "Test instruction",
            },
          },
        ],
        arguments: [],
        tools: [],
        _meta: { prompt },
      });
    });

    it("should handle invalid argument schemas", () => {
      const prompt: SystempromptPromptResponse = {
        id: "test-prompt-3",
        metadata: {
          title: "Test Prompt",
          description: "Test Description",
          created: "2024-01-01",
          updated: "2024-01-01",
          version: 1,
          status: "active",
          author: "test",
          log_message: "Initial version",
          tag: ["test"],
        },
        instruction: {
          static: "Test instruction",
          dynamic: "",
          state: "",
        },
        input: {
          name: "test-input",
          description: "Test input",
          type: ["object"],
          schema: {
            type: "object",
            properties: {
              boolProp: { type: "boolean" },
              nullProp: { type: "null" },
              stringProp: { type: "string" },
              validProp: {
                type: "string",
                description: "Valid property",
              },
            },
            required: ["validProp"],
          },
        },
        output: {
          name: "test-output",
          description: "Test output",
          type: ["object"],
          schema: {
            type: "object",
            properties: {},
          },
        },
        _link: "test-link",
      };

      const result = mapPromptToGetPromptResult(prompt);

      expect(result.arguments).toEqual([
        {
          name: "boolProp",
          description: "",
          required: false,
        },
        {
          name: "nullProp",
          description: "",
          required: false,
        },
        {
          name: "stringProp",
          description: "",
          required: false,
        },
        {
          name: "validProp",
          description: "Valid property",
          required: true,
        },
      ]);
    });

    it("should correctly map a single prompt to GetPromptResult format", () => {
      const result = mapPromptToGetPromptResult(mockSystemPromptResult);

      expect(result.name).toBe(mockSystemPromptResult.metadata.title);
      expect(result.description).toBe(
        mockSystemPromptResult.metadata.description
      );
      expect(result.messages).toEqual([
        {
          role: "assistant",
          content: {
            type: "text",
            text: mockSystemPromptResult.instruction.static,
          },
        },
      ]);
      expect(result.tools).toEqual([]);
      expect(result._meta).toEqual({ prompt: mockSystemPromptResult });
    });

    it("should handle prompts with array inputs", () => {
      const result = mapPromptToGetPromptResult(mockArrayPromptResult);

      expect(result.name).toBe(mockArrayPromptResult.metadata.title);
      expect(result.description).toBe(
        mockArrayPromptResult.metadata.description
      );
      expect(result.messages).toEqual([
        {
          role: "assistant",
          content: {
            type: "text",
            text: mockArrayPromptResult.instruction.static,
          },
        },
      ]);
      expect(result.tools).toEqual([]);
      expect(result._meta).toEqual({ prompt: mockArrayPromptResult });
    });

    it("should handle prompts with nested object inputs", () => {
      const result = mapPromptToGetPromptResult(mockNestedPromptResult);

      expect(result.name).toBe(mockNestedPromptResult.metadata.title);
      expect(result.description).toBe(
        mockNestedPromptResult.metadata.description
      );
      expect(result.messages).toEqual([
        {
          role: "assistant",
          content: {
            type: "text",
            text: mockNestedPromptResult.instruction.static,
          },
        },
      ]);
      expect(result.tools).toEqual([]);
      expect(result._meta).toEqual({ prompt: mockNestedPromptResult });
    });
  });

  describe("mapPromptsToListPromptsResult", () => {
    it("should map an array of prompts", () => {
      const prompts: SystempromptPromptResponse[] = [
        {
          id: "prompt-1",
          metadata: {
            title: "Prompt 1",
            description: "Description 1",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1,
            status: "active",
            author: "test",
            log_message: "Initial version",
            tag: ["test"],
          },
          instruction: {
            static: "Instruction 1",
            dynamic: "",
            state: "",
          },
          input: {
            name: "input-1",
            description: "Input 1",
            type: ["object"],
            schema: {
              type: "object",
              properties: {},
            },
          },
          output: {
            name: "output-1",
            description: "Output 1",
            type: ["object"],
            schema: {
              type: "object",
              properties: {},
            },
          },
          _link: "link-1",
        },
        {
          id: "prompt-2",
          metadata: {
            title: "Prompt 2",
            description: "Description 2",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1,
            status: "active",
            author: "test",
            log_message: "Initial version",
            tag: ["test"],
          },
          instruction: {
            static: "Instruction 2",
            dynamic: "",
            state: "",
          },
          input: {
            name: "input-2",
            description: "Input 2",
            type: ["object"],
            schema: {
              type: "object",
              properties: {},
            },
          },
          output: {
            name: "output-2",
            description: "Output 2",
            type: ["object"],
            schema: {
              type: "object",
              properties: {},
            },
          },
          _link: "link-2",
        },
      ];

      const result = mapPromptsToListPromptsResult(prompts);

      expect(result).toEqual({
        _meta: { prompts },
        prompts: [
          {
            name: "Prompt 1",
            description: "Description 1",
            arguments: [],
          },
          {
            name: "Prompt 2",
            description: "Description 2",
            arguments: [],
          },
        ],
      });
    });

    it("should handle empty prompt array", () => {
      const result = mapPromptsToListPromptsResult([]);

      expect(result.prompts).toHaveLength(0);
      expect(result._meta).toEqual({ prompts: [] });
    });
  });

  describe("mapBlockToReadResourceResult", () => {
    const mockBlock: SystempromptBlockResponse = {
      id: "block-123",
      content: "Test block content",
      prefix: "{{message}}",
      metadata: {
        title: "Test Block",
        description: "Test block description",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: 1,
        status: "published",
        author: "test-user",
        log_message: "Initial creation",
        tag: ["test"],
      },
    };

    it("should map a block to read resource result", () => {
      const block: SystempromptBlockResponse = {
        id: "test-block",
        prefix: "test-prefix",
        metadata: {
          title: "Test Block",
          description: "Test Description",
          created: "2024-01-01",
          updated: "2024-01-01",
          version: 1,
          status: "active",
          author: "test",
          log_message: "Initial version",
          tag: ["test"],
        },
        content: "Test content",
        _link: "test-link",
      };

      const result = mapBlockToReadResourceResult(block);

      expect(result).toEqual({
        contents: [
          {
            uri: "resource:///block/test-block",
            mimeType: "text/plain",
            text: "Test content",
          },
        ],
        _meta: {},
      });
    });

    it("should correctly map a single block to ReadResourceResult format", () => {
      const result = mapBlockToReadResourceResult(mockBlock);

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]).toEqual({
        uri: `resource:///block/${mockBlock.id}`,
        mimeType: "text/plain",
        text: mockBlock.content,
      });
      expect(result._meta).toEqual({});
    });
  });

  describe("mapBlocksToListResourcesResult", () => {
    const mockBlocks: SystempromptBlockResponse[] = [
      {
        id: "block-123",
        content: "Test block content 1",
        prefix: "{{message}}",
        metadata: {
          title: "Test Block 1",
          description: "Test block description 1",
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          version: 1,
          status: "published",
          author: "test-user",
          log_message: "Initial creation",
          tag: ["test"],
        },
      },
      {
        id: "block-456",
        content: "Test block content 2",
        prefix: "{{message}}",
        metadata: {
          title: "Test Block 2",
          description: null,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          version: 1,
          status: "published",
          author: "test-user",
          log_message: "Initial creation",
          tag: ["test"],
        },
      },
    ];

    it("should map blocks to list resources result", () => {
      const blocks: SystempromptBlockResponse[] = [
        {
          id: "block-1",
          prefix: "prefix-1",
          metadata: {
            title: "Block 1",
            description: "Description 1",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1,
            status: "active",
            author: "test",
            log_message: "Initial version",
            tag: ["test"],
          },
          content: "Content 1",
          _link: "link-1",
        },
        {
          id: "block-2",
          prefix: "prefix-2",
          metadata: {
            title: "Block 2",
            description: "Description 2",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1,
            status: "active",
            author: "test",
            log_message: "Initial version",
            tag: ["test"],
          },
          content: "Content 2",
          _link: "link-2",
        },
      ];

      const result = mapBlocksToListResourcesResult(blocks);

      expect(result).toEqual({
        _meta: {},
        resources: [
          {
            uri: "resource:///block/block-1",
            name: "Block 1",
            description: "Description 1",
            mimeType: "text/plain",
          },
          {
            uri: "resource:///block/block-2",
            name: "Block 2",
            description: "Description 2",
            mimeType: "text/plain",
          },
        ],
      });
    });

    it("should correctly map an array of blocks to ListResourcesResult format", () => {
      const result = mapBlocksToListResourcesResult(mockBlocks);

      expect(result.resources).toHaveLength(2);
      expect(result.resources[0]).toEqual({
        uri: `resource:///block/${mockBlocks[0].id}`,
        name: mockBlocks[0].metadata.title,
        description: mockBlocks[0].metadata.description,
        mimeType: "text/plain",
      });
      expect(result.resources[1]).toEqual({
        uri: `resource:///block/${mockBlocks[1].id}`,
        name: mockBlocks[1].metadata.title,
        description: undefined,
        mimeType: "text/plain",
      });
      expect(result._meta).toEqual({});
    });

    it("should handle empty block array", () => {
      const result = mapBlocksToListResourcesResult([]);

      expect(result.resources).toHaveLength(0);
      expect(result._meta).toEqual({});
    });
  });
});
