import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MeshesApiClient } from '../client.js';
import {
  SESSION_LAUNCH_PAGES,
  SESSION_ROLES,
  SESSION_SCOPES,
  SESSION_STATUSES,
  SESSION_TYPES,
  type SessionLaunchPage,
  type SessionRole,
  type SessionScope,
  type SessionStatus,
  type SessionType,
} from '../types.js';
import { toolError, toolOk } from '../utils.js';

export function registerSessionTools(
  server: McpServer,
  client: MeshesApiClient,
) {
  server.registerTool(
    'meshes_create_session',
    {
      title: 'Create Session',
      description:
        'Mint a new embedded session with an access token and launch URL. Sessions can target full workspaces, dashboard-only views, or resource-scoped embeds.',
      inputSchema: {
        workspace_id: z.string().uuid().describe('The workspace UUID'),
        role: z
          .enum(SESSION_ROLES)
          .default('member')
          .optional()
          .describe('Workspace role for the session'),
        session_type: z
          .enum(SESSION_TYPES)
          .default('workspace')
          .optional()
          .describe(
            'Session scope: full workspace, resource-scoped view, or dashboard-only.',
          ),
        external_user_id: z
          .string()
          .max(255)
          .optional()
          .describe('Optional application-specific user identifier'),
        ttl_seconds: z
          .number()
          .int()
          .min(300)
          .max(3600)
          .default(1800)
          .optional()
          .describe('Access token lifetime in seconds'),
        launch_ttl_seconds: z
          .number()
          .int()
          .min(15)
          .max(60)
          .default(30)
          .optional()
          .describe('Launch token lifetime in seconds'),
        launch_page: z
          .enum(SESSION_LAUNCH_PAGES)
          .default('dashboard')
          .optional()
          .describe('Initial top-level embed page'),
        resource: z
          .string()
          .min(1)
          .optional()
          .describe('Resource type for resource-scoped sessions'),
        resource_id: z
          .string()
          .min(1)
          .optional()
          .describe('Resource ID for resource-scoped sessions'),
        allowed_origins: z
          .array(z.string().url())
          .max(10)
          .optional()
          .describe('Optional allowlist of embed origins'),
        scopes: z
          .array(z.enum(SESSION_SCOPES))
          .max(20)
          .optional()
          .describe('Optional extra session scopes'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({
      workspace_id,
      role,
      session_type,
      external_user_id,
      ttl_seconds,
      launch_ttl_seconds,
      launch_page,
      resource,
      resource_id,
      allowed_origins,
      scopes,
    }) => {
      try {
        return toolOk(
          await client.createSession({
            workspace_id,
            role: role as SessionRole | undefined,
            session_type: session_type as SessionType | undefined,
            external_user_id,
            ttl_seconds,
            launch_ttl_seconds,
            launch_page: launch_page as SessionLaunchPage | undefined,
            resource,
            resource_id,
            allowed_origins,
            scopes: scopes as SessionScope[] | undefined,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_list_sessions',
    {
      title: 'List Sessions',
      description:
        'List embedded sessions for a workspace with optional pagination, status, and resource filters.',
      inputSchema: {
        workspace_id: z.string().uuid().describe('The workspace UUID'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .default(50)
          .optional()
          .describe('Results per page'),
        cursor: z
          .string()
          .regex(/^[A-Za-z0-9_-]+$/)
          .optional()
          .describe("Pagination cursor from a previous response's next_cursor"),
        status: z
          .enum(SESSION_STATUSES)
          .optional()
          .describe('Optional session status filter'),
        resource: z
          .string()
          .min(1)
          .optional()
          .describe('Optional resource type filter'),
        resource_id: z
          .string()
          .min(1)
          .optional()
          .describe('Optional resource ID filter'),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ workspace_id, limit, cursor, status, resource, resource_id }) => {
      try {
        return toolOk(
          await client.listSessions({
            workspace_id,
            limit,
            cursor,
            status: status as SessionStatus | undefined,
            resource,
            resource_id,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_refresh_session',
    {
      title: 'Refresh Session',
      description:
        'Refresh the access token for an existing session without minting a new session record.',
      inputSchema: {
        session_id: z.string().min(1).describe('The session ID'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ session_id }) => {
      try {
        return toolOk(await client.refreshSession(session_id));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    'meshes_revoke_session',
    {
      title: 'Revoke Session',
      description: 'Revoke an active embedded session.',
      inputSchema: {
        session_id: z.string().min(1).describe('The session ID'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ session_id }) => {
      try {
        return toolOk(await client.revokeSession(session_id));
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
