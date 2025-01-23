import { serverConfig, serverCapabilities } from "../server-config";
import type {
  Implementation,
  ServerCapabilities,
} from "@modelcontextprotocol/sdk/types.js";

describe("server-config", () => {
  describe("serverConfig", () => {
    it("should have correct implementation details", () => {
      const config = serverConfig as Implementation;
      expect(config.name).toBe("systemprompt-agent-server");
      expect(config.version).toBe("1.0.0");
      expect(config.metadata).toBeDefined();
    });

    it("should have correct metadata", () => {
      const config = serverConfig as Implementation;
      const metadata = config.metadata as {
        name: string;
        description: string;
        icon: string;
        color: string;
        serverStartTime: number;
        environment: string | undefined;
        customData: {
          serverFeatures: string[];
        };
      };

      expect(metadata.name).toBe("System Prompt Agent Server");
      expect(metadata.description).toBe(
        "A specialized MCP server for creating and managing systemprompt.io compatible prompts"
      );
      expect(metadata.icon).toBe("solar:align-horizontal-center-line-duotone");
      expect(metadata.color).toBe("primary");
      expect(metadata.serverStartTime).toBeDefined();
      expect(typeof metadata.serverStartTime).toBe("number");
      expect(metadata.environment).toBe(process.env.NODE_ENV);
      expect(metadata.customData).toEqual({
        serverFeatures: ["agent", "prompts", "systemprompt"],
      });
    });
  });

  describe("serverCapabilities", () => {
    it("should have correct capabilities structure", () => {
      const config = serverCapabilities as { capabilities: ServerCapabilities };
      expect(config.capabilities).toBeDefined();
      const { capabilities } = config;

      expect(capabilities.resources).toEqual({
        listChanged: true,
      });

      expect(capabilities.tools).toEqual({});

      expect(capabilities.prompts).toEqual({
        listChanged: true,
      });

      expect(capabilities.sampling).toEqual({});
    });
  });
});
