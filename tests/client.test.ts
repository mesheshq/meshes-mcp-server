import { describe, it, expect, vi, beforeEach } from "vitest";
import { MeshesApiClient } from "../src/client.js";

globalThis.fetch = vi.fn();

describe("MeshesApiClient", () => {
  let client: MeshesApiClient;

  beforeEach(() => {
    client = new MeshesApiClient({
      accessKey: "test_access",
      secretKey: "test_secret",
      orgId: "test_org",
      baseUrl: "https://api.test.io",
    });
    vi.resetAllMocks();
  });

  it("should construct correct Authorization header", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ records: [] }),
    } as Response);

    await client.listWorkspaces();

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe("https://api.test.io/api/v1/workspaces");
    expect(call[1]?.headers).toHaveProperty("Authorization");
    expect(
      (call[1]?.headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
  });

  it("should handle network errors gracefully", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    } as Response);

    await expect(client.listWorkspaces()).rejects.toThrow(
      "Meshes API 401: Unauthorized"
    );
  });

  it("should handle rate limiting gracefully", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => "Too Many Requests",
    } as Response);

    await expect(client.listWorkspaces()).rejects.toThrow(
      "Meshes API 429: Too Many Requests"
    );
  });
});
