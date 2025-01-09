#!/usr/bin/env node

import { startServer } from "./index.js";

const apiKey = process.argv[2];
if (!apiKey) {
  console.error(
    "API key is required. Usage: systemprompt-agent-server <API_KEY>"
  );
  process.exit(1);
}

startServer(apiKey).catch((error: Error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
