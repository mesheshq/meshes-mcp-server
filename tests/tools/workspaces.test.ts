import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MeshesApiClient } from "../../src/client.js";
import { registerWorkspaceTools } from "../../src/tools/workspaces.js";

vi.mock("../../src/client.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    MeshesApiClient: class {
      listWorkspaces = vi.fn();
      getWorkspace = vi.fn();
      createWorkspace = vi.fn();
      updateWorkspace = vi.fn();
      getWorkspaceConnections = vi.fn();
      getWorkspaceRules = vi.fn();
    },
  };
});

describe("workspace tools", () => {
  let server: McpServer;
  let client: any;

  beforeEach(() => {
    client = new MeshesApiClient({} as any);
    server = new McpServer({ name: "test", version: "1.0.0" });
    vi.spyOn(server, "registerTool");
    registerWorkspaceTools(server, client as any);
  });

  it("registers all workspace tools", () => {
    const tools = vi.mocked(server.registerTool).mock.calls.map((c) => c[0]);
    expect(tools).toContain("meshes_list_workspaces");
    expect(tools).toContain("meshes_get_workspace");
    expect(tools).toContain("meshes_create_workspace");
    expect(tools).toContain("meshes_update_workspace");
    expect(tools).toContain("meshes_get_workspace_connections");
    expect(tools).toContain("meshes_get_workspace_rules");
  });

  it("handlers should call listWorkspaces and return ok", async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === "meshes_list_workspaces");
    const handler = call![2] as Function;

    client.listWorkspaces.mockResolvedValueOnce({ records: [] });

    const result = await handler({});

    expect(client.listWorkspaces).toHaveBeenCalled();
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("records");
  });

  it("create handler passes properties", async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === "meshes_create_workspace");
    const handler = call![2] as Function;

    client.createWorkspace.mockResolvedValueOnce({
      workspace: { id: "ws_123" },
    });

    await handler({ name: "Test", description: "desc" });

    expect(client.createWorkspace).toHaveBeenCalledWith({
      name: "Test",
      description: "desc",
    });
  });
});
