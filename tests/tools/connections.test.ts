import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MeshesApiClient } from '../../src/client.js';
import { registerConnectionTools } from '../../src/tools/connections.js';

vi.mock('../../src/client.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    MeshesApiClient: class {
      listConnections = vi.fn();
      getConnection = vi.fn();
      createConnection = vi.fn();
      updateConnection = vi.fn();
      deleteConnection = vi.fn();
      getConnectionActions = vi.fn();
      getConnectionFields = vi.fn();
      getConnectionDefaultMappings = vi.fn();
      listIntegrations = vi.fn();
    },
  };
});

describe('connection tools', () => {
  let server: McpServer;
  let client: any;

  beforeEach(() => {
    client = new MeshesApiClient({} as any);
    server = new McpServer({ name: 'test', version: '1.0.0' });
    vi.spyOn(server, 'registerTool');

    registerConnectionTools(server, client as any);
  });

  it('registers all connection and integration tools', () => {
    const tools = vi.mocked(server.registerTool).mock.calls.map((c) => c[0]);
    expect(tools.length).toBeGreaterThan(0);
    expect(tools).toContain('meshes_list_connections');
    expect(tools).toContain('meshes_create_connection');
    expect(tools).toContain('meshes_delete_connection');
    expect(tools).toContain('meshes_list_integrations');
  });

  it('create handler passes properties successfully', async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === 'meshes_create_connection');
    const handler = call?.[2] as (args: any) => Promise<any>;

    client.createConnection.mockResolvedValueOnce({
      connection: { id: 'conn_123' },
    });

    await handler({
      workspace: 'ws',
      type: 'webhook',
      name: 'N',
      metadata: {},
      hidden: false,
    });

    expect(client.createConnection).toHaveBeenCalledWith({
      workspace: 'ws',
      type: 'webhook',
      name: 'N',
      metadata: {},
      hidden: false,
    });
  });

  it('delete handler manages force deletion flag', async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === 'meshes_delete_connection');
    const handler = call?.[2] as (args: any) => Promise<any>;

    client.deleteConnection.mockResolvedValueOnce({ id: 'conn_123' });

    await handler({ connection_id: 'conn_123', force_delete: true });

    expect(client.deleteConnection).toHaveBeenCalledWith('conn_123', true);
  });

  it('default mappings handler returns toolError on failure', async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find(
        (c) => c[0] === 'meshes_get_connection_default_mappings',
      );
    const handler = call?.[2] as (args: any) => Promise<any>;

    client.getConnectionDefaultMappings.mockRejectedValueOnce(
      new Error('Mappings unavailable'),
    );

    const result = await handler({ connection_id: 'conn_123' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Mappings unavailable');
  });

  it('list integrations handler returns toolError on failure', async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === 'meshes_list_integrations');
    const handler = call?.[2] as (args: any) => Promise<any>;

    client.listIntegrations.mockRejectedValueOnce(new Error('Denied'));

    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Denied');
  });
});
