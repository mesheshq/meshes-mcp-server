import { describe, expect, it } from 'vitest';
import { MeshesApiClient } from '../src/client.js';
import { createServer } from '../src/server.js';

describe('Server', () => {
  it('instantiates the server and registers tools', async () => {
    const client = new MeshesApiClient({
      accessKey: 'k',
      secretKey: 's',
      orgId: 'o',
      baseUrl: 'b',
    });

    expect(() => createServer(client)).not.toThrow();
  });
});
