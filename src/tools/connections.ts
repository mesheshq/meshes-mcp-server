import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MeshesApiClient } from '../client.js';
import { INTEGRATION_TYPES, type IntegrationType } from '../types.js';
import { toolError, toolOk } from '../utils.js';

export function registerConnectionTools(
  server: McpServer,
  client: MeshesApiClient,
) {
  server.registerTool(
    'meshes_list_connections',
    {
      title: 'List Connections',
      description:
        'List all connections across the organization. Connections are configured destinations (HubSpot, Salesforce, Resend, webhooks, etc.) holding credentials and config.',
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
        return toolOk(await client.listConnections());
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_get_connection',
    {
      title: 'Get Connection',
      description:
        'Get details of a specific connection. Does not expose raw credentials.',
      inputSchema: {
        connection_id: z.string().uuid().describe('The connection UUID'),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ connection_id }) => {
      try {
        return toolOk(await client.getConnection(connection_id));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_create_connection',
    {
      title: 'Create Connection',
      description:
        'Create a new connection (destination) in a workspace. The metadata object contains connector-specific configuration (API keys, OAuth tokens, webhook URLs, etc.).',
      inputSchema: {
        workspace: z
          .string()
          .uuid()
          .describe('The workspace UUID this connection belongs to'),
        type: z.enum(INTEGRATION_TYPES).describe('Integration type'),
        name: z
          .string()
          .min(1)
          .max(128)
          .describe('Connection name (alphanumeric/space/underscore/dash)'),
        metadata: z
          .record(z.string(), z.unknown())
          .describe('Connector-specific configuration'),
        hidden: z
          .boolean()
          .default(false)
          .optional()
          .describe('Hide from UI (default false)'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ workspace, type, name, metadata, hidden }) => {
      try {
        return toolOk(
          await client.createConnection({
            workspace,
            type: type as IntegrationType,
            name,
            metadata,
            hidden,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_update_connection',
    {
      title: 'Update Connection',
      description: "Update a connection's name, metadata, or visibility.",
      inputSchema: {
        connection_id: z.string().uuid().describe('The connection UUID'),
        name: z.string().min(1).max(128).describe('Updated name'),
        metadata: z
          .record(z.string(), z.unknown())
          .describe('Updated connector-specific configuration'),
        hidden: z.boolean().optional().describe('Hide from UI'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ connection_id, name, metadata, hidden }) => {
      try {
        return toolOk(
          await client.updateConnection(connection_id, {
            name,
            metadata,
            hidden,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_delete_connection',
    {
      title: 'Delete Connection',
      description:
        'Delete a connection. Returns 409 if it has active rules unless force_delete is true.',
      inputSchema: {
        connection_id: z.string().uuid().describe('The connection UUID'),
        force_delete: z
          .boolean()
          .default(false)
          .optional()
          .describe('Force delete even if rules exist'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ connection_id, force_delete }) => {
      try {
        return toolOk(
          await client.deleteConnection(connection_id, force_delete),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_get_connection_actions',
    {
      title: 'Get Connection Actions',
      description:
        'Get available actions for a connection (e.g., create_or_update_contact, add_to_list). Use this to discover what actions to put in rule metadata.',
      inputSchema: {
        connection_id: z.string().uuid().describe('The connection UUID'),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ connection_id }) => {
      try {
        return toolOk(await client.getConnectionActions(connection_id));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_get_connection_fields',
    {
      title: 'Get Connection Fields',
      description:
        'Get the destination field catalog for a connection. Returns field keys, types, constraints, and allowed values. Useful for building field mappings.',
      inputSchema: {
        connection_id: z.string().uuid().describe('The connection UUID'),
        refresh: z
          .boolean()
          .default(false)
          .optional()
          .describe('Force refresh the field catalog from the provider'),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ connection_id, refresh }) => {
      try {
        return toolOk(await client.getConnectionFields(connection_id, refresh));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_get_connection_default_mappings',
    {
      title: 'Get Connection Default Mappings',
      description:
        'Get the default field mapping for a connection. Mappings define how event payload fields map to destination fields with optional transforms (trim, lower, upper, to_string, etc.).',
      inputSchema: {
        connection_id: z.string().uuid().describe('The connection UUID'),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ connection_id }) => {
      try {
        return toolOk(await client.getConnectionDefaultMappings(connection_id));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_list_integrations',
    {
      title: 'List Integrations',
      description:
        "Get metadata about all supported integration types. Returns each type's authentication method (oauth, api_key, basic, none), available actions, and field definitions. Useful for discovering what integrations are possible and what actions they support.",
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
        return toolOk(await client.listIntegrations());
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
