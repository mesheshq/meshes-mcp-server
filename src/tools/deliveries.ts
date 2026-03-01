import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { MeshesApiClient } from "../client.js";
import { toolError, toolOk } from "../utils.js";
import type { EventStatus } from "../types.js";

const EVENT_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;

export function registerDeliveryTools(
  server: McpServer,
  client: MeshesApiClient
) {
  server.registerTool(
    "meshes_get_workspace_events",
    {
      title: "Get Workspace Events",
      description:
        "List events for a workspace with optional filters. Useful for checking delivery status, debugging, or monitoring event flow.",
      inputSchema: {
        workspace_id: z.string().uuid().describe("The workspace UUID"),
        limit: z
          .number()
          .min(1)
          .max(200)
          .default(50)
          .optional()
          .describe("Results per page (1-200, default 50)"),
        cursor: z
          .string()
          .optional()
          .describe("Pagination cursor from previous response's next_cursor"),
        event: z
          .string()
          .optional()
          .describe("Filter by event type (e.g., 'user.signup')"),
        status: z
          .enum(EVENT_STATUSES)
          .optional()
          .describe("Filter by delivery status"),
        resource: z.string().optional().describe("Filter by resource type"),
        resource_id: z.string().optional().describe("Filter by resource ID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({
      workspace_id,
      limit,
      cursor,
      event,
      status,
      resource,
      resource_id,
    }) => {
      try {
        return toolOk(
          await client.getWorkspaceEvents(workspace_id, {
            limit,
            cursor,
            event,
            status: status as EventStatus | undefined,
            resource,
            resource_id,
          })
        );
      } catch (e) {
        return toolError(e);
      }
    }
  );

  server.registerTool(
    "meshes_list_events",
    {
      title: "List Events",
      description: "List events across the organization with pagination.",
      inputSchema: {
        limit: z
          .number()
          .min(1)
          .max(200)
          .default(50)
          .optional()
          .describe("Results per page (1-200, default 50)"),
        cursor: z
          .string()
          .optional()
          .describe("Pagination cursor from previous response"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ limit, cursor }) => {
      try {
        return toolOk(await client.listEvents({ limit, cursor }));
      } catch (e) {
        return toolError(e);
      }
    }
  );

  server.registerTool(
    "meshes_get_event",
    {
      title: "Get Event",
      description:
        "Get event details including delivery status and per-rule results (rule_events). Each rule_event shows connection, integration_type, status, attempt_count, and last_error.",
      inputSchema: {
        event_id: z.string().uuid().describe("The event UUID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ event_id }) => {
      try {
        return toolOk(await client.getEvent(event_id));
      } catch (e) {
        return toolError(e);
      }
    }
  );

  server.registerTool(
    "meshes_get_event_payload",
    {
      title: "Get Event with Payload",
      description:
        "Get event details including the full event payload. Useful for debugging what data was sent.",
      inputSchema: {
        event_id: z.string().uuid().describe("The event UUID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ event_id }) => {
      try {
        return toolOk(await client.getEventPayload(event_id));
      } catch (e) {
        return toolError(e);
      }
    }
  );

  server.registerTool(
    "meshes_retry_event_rule",
    {
      title: "Retry Event Rule",
      description:
        "Manually retry a failed rule delivery for a specific event. Use after investigating and fixing the underlying issue (e.g., expired credentials, misconfigured mapping).",
      inputSchema: {
        event_id: z.string().uuid().describe("The event UUID"),
        rule_id: z
          .string()
          .uuid()
          .describe("The rule UUID (from rule_events in the event detail)"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ event_id, rule_id }) => {
      try {
        return toolOk(await client.retryEventRule(event_id, rule_id));
      } catch (e) {
        return toolError(e);
      }
    }
  );
}
