import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MeshesApiClient } from '../src/client.js';

globalThis.fetch = vi.fn();

const VALID_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_ACCESS_KEY = 'mk_abcdefghijklmnopqrstuv';
const VALID_SECRET_KEY = 'abcdefghijklmnopqrstuvwxyzABCDEFG1234567890_';

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
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ records: [] }),
    } as Response);

    await client.listWorkspaces();

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe('https://api.test.io/api/v1/workspaces');
    expect(call[1]?.headers).toHaveProperty('Authorization');
    expect((call[1]?.headers as Record<string, string>).Authorization).toMatch(
      /^Bearer /,
    );
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

  it('should send force delete body for connection deletes', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ id: 'conn_123', type: 'webhook' }),
    } as Response);

    await client.deleteConnection('conn_123', true);

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe('https://api.test.io/api/v1/connections/conn_123');
    expect(call[1]?.method).toBe('DELETE');
    expect(call[1]?.body).toBe(JSON.stringify({ force_delete: true }));
  });
});
