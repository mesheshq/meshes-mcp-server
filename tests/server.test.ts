import { describe, it, expect } from "vitest";
import { createServer } from "../src/server.js";
import { MeshesApiClient } from "../src/client.js";

describe("Server", () => {
  it("instantiates the server and registers tools", async () => {
    const client = new MeshesApiClient({
      accessKey: "k",
      secretKey: "s",
      orgId: "o",
      baseUrl: "b",
    });

    expect(() => createServer(client)).not.toThrow();
  });
});
