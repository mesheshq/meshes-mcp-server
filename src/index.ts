#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MeshesApiClient } from './client.js';
import { createServer } from './server.js';

// ── Configuration ─────────────────────────────────────────────
// Authentication uses short-lived HS256 JWTs minted from your
// Meshes machine key credentials. The server generates a fresh
// token for each API request (tokens expire in 30 seconds).
// See: https://meshes.io/docs/api/authentication

const ACCESS_KEY = process.env.MESHES_ACCESS_KEY;
const SECRET_KEY = process.env.MESHES_SECRET_KEY;
const ORG_ID = process.env.MESHES_ORG_ID || process.env.MESHES_ORGANIZATION_ID;
const BASE_URL = process.env.MESHES_API_URL || 'https://api.meshes.io';

if (!ACCESS_KEY || !SECRET_KEY || !ORG_ID) {
  const missing = [];
  if (!ACCESS_KEY) missing.push('MESHES_ACCESS_KEY');
  if (!SECRET_KEY) missing.push('MESHES_SECRET_KEY');
  if (!ORG_ID) missing.push('MESHES_ORG_ID (or MESHES_ORGANIZATION_ID)');

  console.error(
    `Error: Missing required environment variable ${missing.join(', ')}\n` +
      `Set it in your MCP client configuration:\n\n` +
      `{\n` +
      `  "mcpServers": {\n` +
      `    "meshes": {\n` +
      `      "command": "npx",\n` +
      `      "args": ["-y", "@mesheshq/mcp-server"],\n` +
      `      "env": {\n` +
      `        "MESHES_ACCESS_KEY": "your_access_key",\n` +
      `        "MESHES_SECRET_KEY": "your_secret_key",\n` +
      `        "MESHES_ORG_ID": "your_organization_uuid"\n` +
      `      }\n` +
      `    }\n` +
      `  }\n` +
      `}\n\n` +
      `Find your credentials in the Meshes dashboard under Profile → API Keys.`,
  );
  process.exit(1);
}

let client: MeshesApiClient;
try {
  client = new MeshesApiClient({
    accessKey: ACCESS_KEY,
    secretKey: SECRET_KEY,
    orgId: ORG_ID,
    baseUrl: BASE_URL,
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to initialize Meshes API client: ${message}`);
  process.exit(1);
}

const server = createServer(client);

// ── Start Server ──────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Meshes MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
