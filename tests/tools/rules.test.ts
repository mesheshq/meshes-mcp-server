import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MeshesApiClient } from "../../src/client.js";
import { registerRuleTools } from "../../src/tools/rules.js";

vi.mock("../../src/client.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    MeshesApiClient: class {
      listRules = vi.fn();
      getRule = vi.fn();
      createRule = vi.fn();
      deleteRule = vi.fn();
    },
  };
});

describe("rule tools", () => {
  let server: McpServer;
  let client: any;

  beforeEach(() => {
    client = new MeshesApiClient({} as any);
    server = new McpServer({ name: "test", version: "1.0.0" });
    vi.spyOn(server, "registerTool");
    registerRuleTools(server, client as any);
  });

  it("registers all rule tools", () => {
    const tools = vi.mocked(server.registerTool).mock.calls.map((c) => c[0]);
    expect(tools).toContain("meshes_list_rules");
    expect(tools).toContain("meshes_get_rule");
    expect(tools).toContain("meshes_create_rule");
    expect(tools).toContain("meshes_delete_rule");
  });

  it("create handler passes unrolls action metadata", async () => {
    const call = vi
      .mocked(server.registerTool)
      .mock.calls.find((c) => c[0] === "meshes_create_rule");
    const handler = call![2] as Function;

    client.createRule.mockResolvedValueOnce({ rule: { id: "rule_123" } });

    await handler({
      workspace: "ws",
      connection: "conn_123",
      event: "user.signup",
      action: "do_thing",
      metadata_extra: {
        other_prop: "val",
      },
    });

    expect(client.createRule).toHaveBeenCalledWith({
      workspace: "ws",
      connection: "conn_123",
      event: "user.signup",
      metadata: { action: "do_thing", other_prop: "val" },
      resource: undefined,
      resource_id: undefined,
      active: undefined,
      hidden: undefined,
    });
  });
});
