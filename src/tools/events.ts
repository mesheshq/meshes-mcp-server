import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MeshesApiClient } from '../client.js';
import { toolError, toolOk } from '../utils.js';

export function registerEventTools(server: McpServer, client: MeshesApiClient) {
  server.registerTool(
    'meshes_emit_event',
    {
      title: 'Emit Event',
      description:
        "Emit a product event to Meshes for routing and delivery. The event is matched against rules in the specified workspace and delivered to all matching connections. Always include 'email' in the payload for person-related events.",
      inputSchema: {
        workspace: z
          .string()
          .uuid()
          .describe('The workspace UUID to emit the event into'),
        event: z
          .string()
          .min(1)
          .describe(
            "Event type (e.g., 'user.signup', 'payment.failed', 'form.submitted')",
          ),
        payload: z
          .record(z.string(), z.unknown())
          .describe(
            "Event payload. Include 'email' for person-related events. Supports: email, id, ip_address, name, first_name, last_name, phone, resource_url, plus custom fields.",
          ),
        resource: z
          .string()
          .optional()
          .describe("Optional resource type (e.g., 'user', 'order')"),
        resource_id: z
          .string()
          .optional()
          .describe('Optional resource ID for deduplication'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ workspace, event, payload, resource, resource_id }) => {
      try {
        const result = await client.emitEvent({
          workspace,
          event,
          payload,
          resource,
          resource_id,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text:
                `Event emitted successfully. ID: ${result.event.id}\n` +
                `Event "${event}" will be routed to all matching rules in workspace ${workspace}.\n\n` +
                JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_emit_bulk_events',
    {
      title: 'Emit Bulk Events',
      description:
        'Emit up to 100 events in a single request. Returns 201 on full success, 207 on partial success with per-event error details.',
      inputSchema: {
        events: z
          .array(
            z.object({
              workspace: z.string().uuid(),
              event: z.string().min(1),
              payload: z.record(z.string(), z.unknown()),
              resource: z.string().optional(),
              resource_id: z.string().optional(),
            }),
          )
          .min(1)
          .max(100)
          .describe('Array of 1-100 event objects'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ events }) => {
      try {
        return toolOk(await client.emitBulkEvents(events));
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
