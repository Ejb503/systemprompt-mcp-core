import {
  handleListResources,
  handleReadResource,
} from "../resource-handlers.js";

describe("Resource Handlers", () => {
  describe("handleListResources", () => {
    it("should return list of available resources", async () => {
      const result = await handleListResources();
      expect(result).toHaveProperty("resources");
      expect(Array.isArray(result.resources)).toBe(true);
      expect(result.resources).toHaveLength(2);

      // Check for expected resources
      const resourceNames = result.resources.map((r) => r.name);
      expect(resourceNames).toContain("API Schema Documentation");
      expect(resourceNames).toContain("Prompt Documentation");

      // Check resource structure
      result.resources.forEach((resource) => {
        expect(resource).toHaveProperty("uri");
        expect(resource).toHaveProperty("mimeType", "text/plain");
        expect(resource).toHaveProperty("name");
        expect(resource).toHaveProperty("description");
      });
    });
  });

  describe("handleReadResource", () => {
    it("should return API schema docs content", async () => {
      const result = await handleReadResource({
        params: { uri: "resource:///api-schema" },
      });
      expect(result).toEqual({
        contents: [
          {
            uri: "resource:///api-schema",
            mimeType: "text/plain",
            text: "https://api.systemprompt.io/v1/schema",
          },
        ],
      });
    });

    it("should return prompt docs content", async () => {
      const result = await handleReadResource({
        params: { uri: "resource:///prompt-docs" },
      });
      expect(result).toEqual({
        contents: [
          {
            uri: "resource:///prompt-docs",
            mimeType: "text/plain",
            text: "https://systemprompt.io/resource/prompt",
          },
        ],
      });
    });

    it("should throw error for unknown resource", async () => {
      await expect(
        handleReadResource({
          params: { uri: "resource:///unknown" },
        })
      ).rejects.toThrow("Resource unknown not found");
    });
  });
});
