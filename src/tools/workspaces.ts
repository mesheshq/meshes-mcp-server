import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { MeshesApiClient } from "../client.js";
import { toolError, toolOk } from "../utils.js";

const _EVENT_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;

export function registerWorkspaceTools(
  server: McpServer,
  client: MeshesApiClient,
) {
  server.registerTool(
    "meshes_list_workspaces",
    {
      title: "List Workspaces",
      description:
        "List all workspaces in the Meshes organization. Workspaces are tenant-scoped containers holding connections, rules, and event logs. In multi-tenant apps, each customer typically has one workspace.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async () => {
      try {
        return toolOk(await client.listWorkspaces());
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "meshes_get_workspace",
    {
      title: "Get Workspace",
      description:
        "Get details of a specific workspace by UUID, including its publishable key for client-side event ingestion.",
      inputSchema: {
        workspace_id: z.string().uuid().describe("The workspace UUID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ workspace_id }) => {
      try {
        return toolOk(await client.getWorkspace(workspace_id));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "meshes_create_workspace",
    {
      title: "Create Workspace",
      description:
        "Create a new workspace. Typically used when onboarding a new tenant in a multi-tenant SaaS app.",
      inputSchema: {
        name: z
          .string()
          .min(3)
          .max(50)
          .describe(
            "Workspace name (3-50 chars, alphanumeric/space/underscore/dash)",
          ),
        description: z
          .string()
          .max(1024)
          .optional()
          .describe("Optional description (max 1024 chars)"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ name, description }) => {
      try {
        return toolOk(await client.createWorkspace({ name, description }));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "meshes_update_workspace",
    {
      title: "Update Workspace",
      description: "Update a workspace's name and description.",
      inputSchema: {
        workspace_id: z.string().uuid().describe("The workspace UUID"),
        name: z.string().min(3).max(50).describe("New name"),
        description: z
          .string()
          .max(1024)
          .nullable()
          .optional()
          .describe("New description (null to clear)"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ workspace_id, name, description }) => {
      try {
        return toolOk(
          await client.updateWorkspace(workspace_id, { name, description }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "meshes_get_workspace_connections",
    {
      title: "Get Workspace Connections",
      description: "List all connections scoped to a specific workspace.",
      inputSchema: {
        workspace_id: z.string().uuid().describe("The workspace UUID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ workspace_id }) => {
      try {
        return toolOk(await client.getWorkspaceConnections(workspace_id));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "meshes_get_workspace_rules",
    {
      title: "Get Workspace Rules",
      description: "List all routing rules scoped to a specific workspace.",
      inputSchema: {
        workspace_id: z.string().uuid().describe("The workspace UUID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ workspace_id }) => {
      try {
        return toolOk(await client.getWorkspaceRules(workspace_id));
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
