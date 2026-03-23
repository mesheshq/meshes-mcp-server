import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MeshesApiClient } from '../src/client.js';

globalThis.fetch = vi.fn();

const VALID_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_ACCESS_KEY = 'mk_abcdefghijklmnopqrstuv';
const VALID_SECRET_KEY = 'abcdefghijklmnopqrstuvwxyzABCDEFG1234567890_';

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe('MeshesApiClient', () => {
  let client: MeshesApiClient;

  beforeEach(() => {
    client = new MeshesApiClient({
      accessKey: VALID_ACCESS_KEY,
      secretKey: VALID_SECRET_KEY,
      orgId: VALID_ORG_ID,
      baseUrl: 'https://api.test.io',
    });
    vi.resetAllMocks();
  });

  it('should construct correct Authorization header', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ records: [] }));

    await client.listWorkspaces();

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe('https://api.test.io/api/v1/workspaces');
    expect(call[1]?.headers).toHaveProperty('Authorization');
    expect((call[1]?.headers as Record<string, string>).Authorization).toMatch(
      /^Bearer /,
    );
  });

  it('should normalize the configured API base URL', async () => {
    const clientWithVersionedUrl = new MeshesApiClient({
      accessKey: VALID_ACCESS_KEY,
      secretKey: VALID_SECRET_KEY,
      orgId: VALID_ORG_ID,
      baseUrl: 'https://api.test.io/api/v1/',
    });

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ records: [] }));

    await clientWithVersionedUrl.listWorkspaces();

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe('https://api.test.io/api/v1/workspaces');
  });

  it('should map workspace methods to expected routes and verbs', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ records: [] }));

    await client.getWorkspace('ws_123');
    await client.createWorkspace({ name: 'Acme', description: 'Tenant' });
    await client.updateWorkspace('ws_123', {
      name: 'Acme 2',
      description: null,
    });
    await client.getWorkspaceConnections('ws_123');
    await client.getWorkspaceRules('ws_123', {
      event: 'user.signup',
      resource: 'user',
      resource_id: 'u_1',
    });
    await client.getWorkspaceEvents('ws_123', {
      limit: 25,
      cursor: 'cur_1',
      event: 'user.signup',
      status: 'failed',
      resource: 'user',
      resource_id: 'u_1',
    });
    await client.getWorkspaceEventTypes('ws_123');
    await client.getWorkspaceResources('ws_123');

    const calls = vi.mocked(fetch).mock.calls;
    expect(calls[0]?.[0]).toBe('https://api.test.io/api/v1/workspaces/ws_123');
    expect(calls[1]?.[1]?.method).toBe('POST');
    expect(calls[1]?.[1]?.body).toBe(
      JSON.stringify({ name: 'Acme', description: 'Tenant' }),
    );
    expect(calls[2]?.[1]?.method).toBe('PUT');
    expect(calls[2]?.[1]?.body).toBe(
      JSON.stringify({ name: 'Acme 2', description: null }),
    );
    expect(calls[3]?.[0]).toBe(
      'https://api.test.io/api/v1/workspaces/ws_123/connections',
    );
    expect(calls[4]?.[0]).toBe(
      'https://api.test.io/api/v1/workspaces/ws_123/rules?event=user.signup&resource=user&resource_id=u_1',
    );
    expect(calls[5]?.[0]).toBe(
      'https://api.test.io/api/v1/workspaces/ws_123/events?limit=25&cursor=cur_1&event=user.signup&status=failed&resource=user&resource_id=u_1',
    );
    expect(calls[6]?.[0]).toBe(
      'https://api.test.io/api/v1/workspaces/ws_123/event-types',
    );
    expect(calls[7]?.[0]).toBe(
      'https://api.test.io/api/v1/workspaces/ws_123/resources',
    );
  });

  it('should map connection, rule, and event methods to expected routes and verbs', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ records: [] }));

    await client.listConnections();
    await client.getConnection('conn_1');
    await client.createConnection({
      workspace: 'ws_1',
      type: 'webhook',
      name: 'Webhook',
      metadata: { endpoint: 'https://example.test' },
      hidden: false,
    });
    await client.updateConnection('conn_1', {
      name: 'Webhook 2',
      metadata: { endpoint: 'https://example.test/v2' },
      hidden: true,
    });
    await client.getConnectionActions('conn_1');
    await client.getConnectionFields('conn_1', true);
    await client.getConnectionDefaultMappings('conn_1');
    await client.updateConnectionDefaultMappings('conn_1', {
      workspace_id: 'ws_1',
      mapping_id: 'map_1',
      expected_version: 2,
      name: 'Default lead mapping',
      schema: {
        schema_version: 1,
        fields: [
          {
            dest: 'email',
            source: { type: 'path', value: 'email' },
          },
        ],
      },
    });
    await client.listRules({
      event: 'user.signup',
      resource: 'user',
      resource_id: 'u_1',
    });
    await client.getRule('rule_1');
    await client.createRule({
      workspace: 'ws_1',
      connection: 'conn_1',
      event: 'user.signup',
      metadata: { action: 'create_contact' },
      active: true,
    });
    await client.deleteRule('rule_1');
    await client.listEvents({ limit: 10, cursor: 'cur_2' });
    await client.emitEvent({
      workspace: 'ws_1',
      event: 'user.signup',
      payload: { email: 'a@example.com' },
      resource: 'user',
      resource_id: 'u_1',
    });
    await client.emitBulkEvents([
      {
        workspace: 'ws_1',
        event: 'user.signup',
        payload: { email: 'a@example.com' },
      },
    ]);
    await client.getEvent('evt_1');
    await client.getEventPayload('evt_1');
    await client.retryEventRule('evt_1', 'rule_1');
    await client.listIntegrations();

    const calls = vi.mocked(fetch).mock.calls;
    expect(calls[0]?.[0]).toBe('https://api.test.io/api/v1/connections');
    expect(calls[1]?.[0]).toBe('https://api.test.io/api/v1/connections/conn_1');
    expect(calls[2]?.[1]?.method).toBe('POST');
    expect(calls[3]?.[1]?.method).toBe('PUT');
    expect(calls[5]?.[0]).toBe(
      'https://api.test.io/api/v1/connections/conn_1/fields?refresh=true',
    );
    expect(calls[7]?.[1]?.method).toBe('PUT');
    expect(calls[7]?.[1]?.body).toBe(
      JSON.stringify({
        workspace_id: 'ws_1',
        mapping_id: 'map_1',
        expected_version: 2,
        name: 'Default lead mapping',
        schema: {
          schema_version: 1,
          fields: [
            {
              dest: 'email',
              source: { type: 'path', value: 'email' },
            },
          ],
        },
      }),
    );
    expect(calls[8]?.[0]).toBe(
      'https://api.test.io/api/v1/rules?event=user.signup&resource=user&resource_id=u_1',
    );
    expect(calls[11]?.[1]?.method).toBe('DELETE');
    expect(calls[12]?.[0]).toBe(
      'https://api.test.io/api/v1/events?limit=10&cursor=cur_2',
    );
    expect(calls[13]?.[1]?.method).toBe('POST');
    expect(calls[14]?.[0]).toBe('https://api.test.io/api/v1/events/bulk');
    expect(calls[17]?.[0]).toBe(
      'https://api.test.io/api/v1/events/evt_1/rules/rule_1/retry',
    );
    expect(calls[18]?.[0]).toBe('https://api.test.io/api/v1/integrations');
  });

  it('should map session methods to expected routes and verbs', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ records: [] }));

    await client.createSession({
      workspace_id: '123e4567-e89b-12d3-a456-426614174111',
      role: 'admin',
      session_type: 'resource',
      external_user_id: 'user_123',
      ttl_seconds: 1200,
      launch_ttl_seconds: 30,
      launch_page: 'events',
      resource: 'contact',
      resource_id: 'contact_123',
      allowed_origins: ['https://app.example.com'],
      scopes: ['events.payload:read'],
    });
    await client.listSessions({
      workspace_id: '123e4567-e89b-12d3-a456-426614174111',
      limit: 25,
      cursor: 'cur_3',
      status: 'active',
      resource: 'contact',
      resource_id: 'contact_123',
    });
    await client.refreshSession('sess_123');
    await client.revokeSession('sess_123');

    const calls = vi.mocked(fetch).mock.calls;
    expect(calls[0]?.[0]).toBe('https://api.test.io/api/v1/sessions');
    expect(calls[0]?.[1]?.method).toBe('POST');
    expect(calls[0]?.[1]?.body).toBe(
      JSON.stringify({
        workspace_id: '123e4567-e89b-12d3-a456-426614174111',
        role: 'admin',
        session_type: 'resource',
        external_user_id: 'user_123',
        ttl_seconds: 1200,
        launch_ttl_seconds: 30,
        launch_page: 'events',
        resource: 'contact',
        resource_id: 'contact_123',
        allowed_origins: ['https://app.example.com'],
        scopes: ['events.payload:read'],
      }),
    );
    expect(calls[1]?.[0]).toBe(
      'https://api.test.io/api/v1/sessions?workspace_id=123e4567-e89b-12d3-a456-426614174111&limit=25&cursor=cur_3&status=active&resource=contact&resource_id=contact_123',
    );
    expect(calls[2]?.[0]).toBe(
      'https://api.test.io/api/v1/sessions/sess_123/refresh',
    );
    expect(calls[2]?.[1]?.method).toBe('POST');
    expect(calls[3]?.[0]).toBe('https://api.test.io/api/v1/sessions/sess_123');
    expect(calls[3]?.[1]?.method).toBe('DELETE');
  });

  it('should handle network errors gracefully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Unauthorized',
    } as Response);

    await expect(client.listWorkspaces()).rejects.toThrow(
      'Meshes API 401: Unauthorized',
    );
  });

  it('should handle rate limiting gracefully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'Too Many Requests',
    } as Response);

    await expect(client.listWorkspaces()).rejects.toThrow(
      'Meshes API 429: Too Many Requests',
    );
  });

  it('should include JSON object details from API error payloads', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => JSON.stringify({ code: 'invalid_payload' }),
    } as Response);

    await expect(client.listWorkspaces()).rejects.toThrow(
      'Meshes API 400: {"code":"invalid_payload"}',
    );
  });

  it('should pass through plain Error instances from the SDK client', async () => {
    const internal = (client as any).apiClient;
    vi.spyOn(internal, 'get').mockRejectedValueOnce(
      new Error('Plain SDK error'),
    );

    await expect(client.listWorkspaces()).rejects.toThrow('Plain SDK error');
  });

  it('should normalize non-Error throws from the SDK client', async () => {
    const internal = (client as any).apiClient;
    vi.spyOn(internal, 'get').mockRejectedValueOnce('non-error-failure');

    await expect(client.listWorkspaces()).rejects.toThrow('non-error-failure');
  });

  it('should send force delete body for connection deletes', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ id: 'conn_123', type: 'webhook' }),
    );

    await client.deleteConnection('conn_123', true);

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe('https://api.test.io/api/v1/connections/conn_123');
    expect(call[1]?.method).toBe('DELETE');
    expect(call[1]?.body).toBe(JSON.stringify({ force_delete: true }));
  });

  it('should omit force delete body when not requested', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ id: 'conn_123', type: 'webhook' }),
    );

    await client.deleteConnection('conn_123', false);

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[1]?.method).toBe('DELETE');
    expect(call[1]?.body).toBeNull();
  });

  it('should allow emitting an event without a workspace field', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ event: { id: 'evt_123' } }),
    );

    await client.emitEvent({
      event: 'user.signup',
      payload: { email: 'a@example.com' },
    });

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe('https://api.test.io/api/v1/events');
    expect(call[1]?.method).toBe('POST');
    expect(call[1]?.body).toBe(
      JSON.stringify({
        event: 'user.signup',
        payload: { email: 'a@example.com' },
      }),
    );
  });
});
