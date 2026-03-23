import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MeshesApiClient } from '../../src/client.js';
import { registerSessionTools } from '../../src/tools/sessions.js';

vi.mock('../../src/client.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    MeshesApiClient: class {
      createSession = vi.fn();
      listSessions = vi.fn();
      refreshSession = vi.fn();
      revokeSession = vi.fn();
    },
  };
});

describe('session tools', () => {
  let server: McpServer;
  let client: any;

  beforeEach(() => {
    client = new MeshesApiClient({} as any);
    server = new McpServer({ name: 'test', version: '1.0.0' });
    vi.spyOn(server, 'registerTool');

    registerSessionTools(server, client as any);
  });

  it('registers all session tools', () => {
    const tools = vi.mocked(server.registerTool).mock.calls.map((c) => c[0]);
    expect(tools).toContain('meshes_create_session');
    expect(tools).toContain('meshes_list_sessions');
    expect(tools).toContain('meshes_refresh_session');
    expect(tools).toContain('meshes_revoke_session');
  });

  it('create session handler passes properties', async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === 'meshes_create_session');
    const handler = call?.[2] as (args: any) => Promise<any>;

    client.createSession.mockResolvedValueOnce({ session_id: 'sess_123' });

    await handler({
      workspace_id: 'ws_123',
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

    expect(client.createSession).toHaveBeenCalledWith({
      workspace_id: 'ws_123',
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
  });

  it('list sessions handler returns ok', async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === 'meshes_list_sessions');
    const handler = call?.[2] as (args: any) => Promise<any>;

    client.listSessions.mockResolvedValueOnce({ records: [] });

    const result = await handler({
      workspace_id: 'ws_123',
      limit: 25,
      cursor: 'cur_1',
      status: 'active',
      resource: 'contact',
      resource_id: 'contact_123',
    });

    expect(client.listSessions).toHaveBeenCalledWith({
      workspace_id: 'ws_123',
      limit: 25,
      cursor: 'cur_1',
      status: 'active',
      resource: 'contact',
      resource_id: 'contact_123',
    });
    expect(result.isError).toBeUndefined();
  });

  it('refresh session handler returns toolError on failure', async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === 'meshes_refresh_session');
    const handler = call?.[2] as (args: any) => Promise<any>;

    client.refreshSession.mockRejectedValueOnce(new Error('Refresh denied'));

    const result = await handler({ session_id: 'sess_123' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Refresh denied');
  });

  it('revoke session handler calls revokeSession', async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === 'meshes_revoke_session');
    const handler = call?.[2] as (args: any) => Promise<any>;

    client.revokeSession.mockResolvedValueOnce({ revoked: true });

    await handler({ session_id: 'sess_123' });

    expect(client.revokeSession).toHaveBeenCalledWith('sess_123');
  });
});
