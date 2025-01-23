export type ToolResponse = {
  content: {
    type: "text" | "resource";
    text: string;
    resource?: {
      uri: string;
      text: string;
      mimeType: string;
    };
  }[];
  _meta?: Record<string, unknown>;
  isError?: boolean;
};
