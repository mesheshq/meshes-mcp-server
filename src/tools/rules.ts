import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MeshesApiClient } from '../client.js';
import type { RuleMetadata } from '../types.js';
import { toolError, toolOk } from '../utils.js';

export function registerRuleTools(server: McpServer, client: MeshesApiClient) {
  server.registerTool(
    'meshes_list_rules',
    {
      title: 'List Rules',
      description:
        'List all routing rules across the organization. Rules bind event types to connections with action metadata. Supports filtering by event, resource, and resource_id.',
      inputSchema: {
        event: z
          .string()
          .optional()
          .describe("Filter by event type (e.g., 'user.signup')"),
        resource: z.string().optional().describe('Filter by resource type'),
        resource_id: z.string().optional().describe('Filter by resource ID'),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ event, resource, resource_id }) => {
      try {
        return toolOk(await client.listRules({ event, resource, resource_id }));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_get_rule',
    {
      title: 'Get Rule',
      description: 'Get details of a specific routing rule by UUID.',
      inputSchema: {
        rule_id: z.string().uuid().describe('The rule UUID'),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ rule_id }) => {
      try {
        return toolOk(await client.getRule(rule_id));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_create_rule',
    {
      title: 'Create Rule',
      description:
        "Create a routing rule that binds an event type to a connection. The metadata.action field is required and determines what the destination does (e.g., 'create_or_update_contact'). Use meshes_get_connection_actions to discover available actions.",
      inputSchema: {
        workspace: z.string().uuid().describe('The workspace UUID'),
        connection: z
          .string()
          .uuid()
          .describe('The connection UUID this rule routes to'),
        event: z
          .string()
          .min(1)
          .describe(
            "Event type to match (e.g., 'user.signup', 'payment.failed')",
          ),
        action: z
          .string()
          .min(1)
          .describe(
            'The action the destination performs (goes into metadata.action)',
          ),
        resource: z
          .string()
          .optional()
          .describe('Optional resource type filter'),
        resource_id: z
          .string()
          .optional()
          .describe(
            'Optional resource ID filter (pattern: ^[A-Za-z0-9._:-]{1,64}$)',
          ),
        active: z
          .boolean()
          .default(true)
          .optional()
          .describe('Whether the rule is active (default true)'),
        hidden: z
          .boolean()
          .default(false)
          .optional()
          .describe('Hide from UI (default false)'),
        metadata_extra: z
          .record(z.string(), z.string())
          .optional()
          .describe(
            'Additional metadata fields (id, name, value, key, data, option, option_value)',
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({
      workspace,
      connection,
      event,
      action,
      resource,
      resource_id,
      active,
      hidden,
      metadata_extra,
    }) => {
      try {
        const metadata: RuleMetadata = { action, ...metadata_extra };
        return toolOk(
          await client.createRule({
            workspace,
            connection,
            event,
            metadata,
            resource,
            resource_id,
            active,
            hidden,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_delete_rule',
    {
      title: 'Delete Rule',
      description:
        'Delete a routing rule. Events matching this rule will no longer be routed to its connection.',
      inputSchema: {
        rule_id: z.string().uuid().describe('The rule UUID'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ rule_id }) => {
      try {
        return toolOk(await client.deleteRule(rule_id));
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
