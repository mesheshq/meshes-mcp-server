import { describe, expect, it } from 'vitest';
import { MeshesApiClient } from '../src/client.js';
import { createServer } from '../src/server.js';

describe('Server', () => {
  it('instantiates the server and registers tools', async () => {
    const client = new MeshesApiClient({
      accessKey: 'mk_abcdefghijklmnopqrstuv',
      secretKey: 'abcdefghijklmnopqrstuvwxyzABCDEFG1234567890_',
      orgId: '123e4567-e89b-12d3-a456-426614174000',
      baseUrl: 'https://api.test.io',
    });

    expect(() => createServer(client)).not.toThrow();
  });
});
