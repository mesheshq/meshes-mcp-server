# @mesheshq/mcp-server

MCP server for [Meshes](https://meshes.io) — emit events, manage workspaces,
create routing rules, and inspect deliveries from any MCP-compatible client.

## Features

- **Emit Events** — send product events (signups, payments, cancellations) to Meshes
- **Manage Workspaces** — list and configure workspaces
- **Routing Rules** — create and update event routing rules
- **Connections** — manage integration connections (HubSpot, Salesforce, Mailchimp, etc.)
- **Delivery Status** — inspect event delivery logs and retry status

## Setup

Create a free Meshes account and create Machine Keys in the dashboard
under Profile → API Keys.

### Claude Code

```bash
claude mcp add meshes \
 -e MESHES_ACCESS_KEY=your_access_key \
 -e MESHES_SECRET_KEY=your_secret_key \
 -e MESHES_ORG_ID=your_org_id \
 -- npx -y @mesheshq/mcp-server
```

### Cursor

Open Cursor Settings → MCP → Add new global MCP server:

```json
{
  "mcpServers": {
    "meshes": {
      "command": "npx",
      "args": ["-y", "@mesheshq/mcp-server"],
      "env": {
        "MESHES_ACCESS_KEY": "your_access_key",
        "MESHES_SECRET_KEY": "your_secret_key",
        "MESHES_ORG_ID": "your_organization_uuid"
      }
    }
  }
}
```

### Claude Desktop

Open Claude Desktop → Settings → Developer → Edit Config:

```json
{
  "mcpServers": {
    "meshes": {
      "command": "npx",
      "args": ["-y", "@mesheshq/mcp-server"],
      "env": {
        "MESHES_ACCESS_KEY": "your_access_key",
        "MESHES_SECRET_KEY": "your_secret_key",
        "MESHES_ORG_ID": "your_organization_uuid"
      }
    }
  }
}
```

### Windsurf

Add to your Windsurf MCP configuration:

```json
{
  "mcpServers": {
    "meshes": {
      "command": "npx",
      "args": ["-y", "@mesheshq/mcp-server"],
      "env": {
        "MESHES_ACCESS_KEY": "your_access_key",
        "MESHES_SECRET_KEY": "your_secret_key",
        "MESHES_ORG_ID": "your_organization_uuid"
      }
    }
  }
}
```

> **Security note:** MCP config files contain your secret key. They
> live in your home directory (e.g. `~/.cursor/mcp.json`), not your
> project repo. Never commit access keys or secret keys to version control.

## Environment Variables

| Variable            | Required | Description                                     |
| ------------------- | -------- | ----------------------------------------------- |
| `MESHES_ACCESS_KEY` | Yes      | Machine access key from dashboard               |
| `MESHES_SECRET_KEY` | Yes      | Machine secret key from dashboard               |
| `MESHES_ORG_ID`     | Yes      | Organization UUID                               |
| `MESHES_API_URL`    | No       | API base URL (default: `https://api.meshes.io`) |

## Available Tools

| Tool                                     | Description                                                    |
| ---------------------------------------- | -------------------------------------------------------------- |
| `meshes_emit_event`                      | Emit a product event to Meshes for routing and delivery        |
| `meshes_emit_bulk_events`                | Emit up to 100 events in a single request                      |
| `meshes_list_workspaces`                 | List all workspaces in the multi-tenant organization           |
| `meshes_get_workspace`                   | Get details of a specific workspace                            |
| `meshes_create_workspace`                | Create a new workspace                                         |
| `meshes_update_workspace`                | Update workspace properties                                    |
| `meshes_list_connections`                | List connections for a workspace                               |
| `meshes_get_connection`                  | Get details of a connection                                    |
| `meshes_create_connection`               | Create a new connection destination                            |
| `meshes_update_connection`               | Update connection configuration metadata                       |
| `meshes_delete_connection`               | Delete a connection                                            |
| `meshes_get_connection_actions`          | Get available actions (destination endpoints) for a connection |
| `meshes_get_connection_fields`           | Get destination field configuration for mappings               |
| `meshes_get_connection_default_mappings` | Get default mappings for a connection                          |
| `meshes_list_rules`                      | List all routing rules                                         |
| `meshes_get_rule`                        | Get details of a specific routing rule                         |
| `meshes_create_rule`                     | Create an event routing rule mapping events to an action       |
| `meshes_delete_rule`                     | Delete an event routing rule                                   |
| `meshes_list_events`                     | List events across the organization with pagination            |
| `meshes_get_workspace_events`            | List events for a workspace with filtered criteria             |
| `meshes_get_event`                       | Get event details with delivery status matrix                  |
| `meshes_get_event_payload`               | Get event details containing data payload                      |
| `meshes_retry_event_rule`                | Retry a failed rule delivery                                   |
| `meshes_list_integrations`               | Get metadata about all supported integration types             |

## Development

```bash
git clone https://github.com/mesheshq/meshes-mcp-server.git
cd meshes-mcp-server
npm install
npm run build
npm test
```

## What is Meshes?

[Meshes](https://meshes.io) is a universal integration layer for SaaS
applications. Emit product events once — signups, payments, form
submissions — and Meshes routes them to CRMs, email tools, webhooks,
and more with retries, fan-out, field mappings, and multi-tenant
isolation built in.

## Documentation

- [Meshes Docs](https://meshes.io/docs)
- [API Reference](https://docs.meshes.dev)
- [MCP Server Docs](https://meshes.io/docs/ai/mcp-server)
- [Authentication](https://meshes.io/docs/api/authentication)

## License

MIT
