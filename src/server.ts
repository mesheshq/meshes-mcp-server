import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MeshesApiClient } from "./client.js";
import { registerWorkspaceTools } from "./tools/workspaces.js";
import { registerConnectionTools } from "./tools/connections.js";
import { registerRuleTools } from "./tools/rules.js";
import { registerEventTools } from "./tools/events.js";
import { registerDeliveryTools } from "./tools/deliveries.js";

export function createServer(client: MeshesApiClient): McpServer {
  const server = new McpServer({
    name: "meshes-mcp-server",
    version: "0.1.0",
  });

  registerWorkspaceTools(server, client);
  registerConnectionTools(server, client);
  registerRuleTools(server, client);
  registerEventTools(server, client);
  registerDeliveryTools(server, client);

  return server;
}
