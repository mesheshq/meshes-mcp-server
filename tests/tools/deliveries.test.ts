import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MeshesApiClient } from "../../src/client.js";
import { registerDeliveryTools } from "../../src/tools/deliveries.js";

vi.mock("../../src/client.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    MeshesApiClient: class {
      getWorkspaceEvents = vi.fn();
      listEvents = vi.fn();
      getEvent = vi.fn();
      getEventPayload = vi.fn();
      retryEventRule = vi.fn();
    },
  };
});

describe("delivery tools", () => {
  let server: McpServer;
  let client: any;

  beforeEach(() => {
    client = new MeshesApiClient({} as any);
    server = new McpServer({ name: "test", version: "1.0.0" });
    vi.spyOn(server, "registerTool");
    registerDeliveryTools(server, client as any);
  });

  it("registers all delivery tools", () => {
    const tools = vi.mocked(server.registerTool).mock.calls.map((c) => c[0]);
    expect(tools).toContain("meshes_get_workspace_events");
    expect(tools).toContain("meshes_list_events");
    expect(tools).toContain("meshes_get_event");
    expect(tools).toContain("meshes_get_event_payload");
    expect(tools).toContain("meshes_retry_event_rule");
  });

  it("handlers should return formatted ok", async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === "meshes_get_workspace_events");
    const handler = call![2] as Function;

    client.getWorkspaceEvents.mockResolvedValueOnce({ records: [] });

    const result = await handler({
      workspace_id: "ws",
      limit: 10,
    });

    expect(client.getWorkspaceEvents).toHaveBeenCalledWith("ws", {
      limit: 10,
      cursor: undefined,
      event: undefined,
      status: undefined,
      resource: undefined,
      resource_id: undefined,
    });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("records");
  });
});
