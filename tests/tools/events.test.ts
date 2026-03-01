import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MeshesApiClient } from "../../src/client.js";
import { registerEventTools } from "../../src/tools/events.js";

vi.mock("../../src/client.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    MeshesApiClient: class {
      emitEvent = vi.fn();
      emitBulkEvents = vi.fn();
    },
  };
});

describe("emit-event tool", () => {
  let server: McpServer;
  let client: any;

  beforeEach(() => {
    client = new MeshesApiClient({} as any);
    server = new McpServer({ name: "test", version: "1.0.0" });

    // In SDK around version >= 1.0.0, we can spy on registerTool
    vi.spyOn(server, "registerTool");
    registerEventTools(server, client as any);
  });

  it("should have correct tool definitions", () => {
    const tools = vi.mocked(server.registerTool).mock.calls.map((c) => c[0]);
    expect(tools).toContain("meshes_emit_event");
    expect(tools).toContain("meshes_emit_bulk_events");
  });

  it("handlers should call the api client correctly and return ok", async () => {
    const emitEventCall = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === "meshes_emit_event");
    const handler = emitEventCall![2] as Function;

    client.emitEvent.mockResolvedValueOnce({
      event: { id: "evt_123" },
    });

    const result = await handler({
      workspace: "ws",
      event: "user.signup",
      payload: { email: "a@b.com" },
    });

    expect(client.emitEvent).toHaveBeenCalledWith({
      workspace: "ws",
      event: "user.signup",
      payload: { email: "a@b.com" },
      resource: undefined,
      resource_id: undefined,
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("evt_123");
  });

  it("returns error on failure", async () => {
    const emitEventCall = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === "meshes_emit_event");
    const handler = emitEventCall![2] as Function;

    client.emitEvent.mockRejectedValueOnce(new Error("Auth failed"));

    const result = await handler({
      workspace: "ws",
      event: "user.signup",
      payload: { email: "a@b.com" },
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Auth failed");
  });
});
