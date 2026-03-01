/**
 * Meshes API client — matches the OpenAPI spec at https://docs.meshes.dev
 * Base URL: https://api.meshes.io
 */

import type {
  Connection,
  EventStatus,
  IntegrationType,
  MeshesConfig,
  MeshesEvent,
  PaginatedResponse,
  Rule,
  RuleEvent,
  RuleMetadata,
  Workspace,
} from './types.js';

// ── JWT Token Generation ──────────────────────────────────────
// Meshes uses short-lived HS256 JWTs for machine-to-machine auth.
// See: https://meshes.io/docs/api/authentication

async function mintJwt(config: MeshesConfig): Promise<string> {
  // Dynamic import — jose is an ESM package
  const { SignJWT } = await import('jose');

  const key = new TextEncoder().encode(config.secretKey);

  const token = await new SignJWT({ org: config.orgId })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT', kid: config.accessKey })
    .setIssuer(`urn:meshes:m2m:${config.accessKey}`)
    .setAudience('meshes-api')
    .setIssuedAt()
    .setExpirationTime('30s')
    .sign(key);

  return token;
}

// ── Client ────────────────────────────────────────────────────

export class MeshesApiClient {
  private config: MeshesConfig;

  constructor(config: MeshesConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await mintJwt(this.config);
    const url = `${this.config.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Meshes API ${response.status}: ${body}`);
    }

    if (response.status === 204) return {} as T;
    return response.json() as Promise<T>;
  }

  // ── Workspaces ────────────────────────────────────────────

  listWorkspaces(): Promise<PaginatedResponse<Workspace>> {
    return this.request('/api/v1/workspaces');
  }

  getWorkspace(id: string): Promise<Workspace> {
    return this.request(`/api/v1/workspaces/${id}`);
  }

  createWorkspace(params: {
    name: string;
    description?: string;
  }): Promise<{ workspace: Workspace }> {
    return this.request('/api/v1/workspaces', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  updateWorkspace(
    id: string,
    params: { name: string; description?: string | null },
  ): Promise<Workspace> {
    return this.request(`/api/v1/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  getWorkspaceConnections(id: string): Promise<PaginatedResponse<Connection>> {
    return this.request(`/api/v1/workspaces/${id}/connections`);
  }

  getWorkspaceRules(id: string): Promise<PaginatedResponse<Rule>> {
    return this.request(`/api/v1/workspaces/${id}/rules`);
  }

  getWorkspaceEvents(
    id: string,
    params?: {
      limit?: number;
      cursor?: string;
      event?: string;
      status?: EventStatus;
      resource?: string;
      resource_id?: string;
    },
  ): Promise<PaginatedResponse<MeshesEvent>> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.event) query.set('event', params.event);
    if (params?.status) query.set('status', params.status);
    if (params?.resource) query.set('resource', params.resource);
    if (params?.resource_id) query.set('resource_id', params.resource_id);
    const qs = query.toString();
    return this.request(`/api/v1/workspaces/${id}/events${qs ? `?${qs}` : ''}`);
  }

  // ── Connections ───────────────────────────────────────────

  listConnections(): Promise<PaginatedResponse<Connection>> {
    return this.request('/api/v1/connections');
  }

  getConnection(id: string): Promise<Connection> {
    return this.request(`/api/v1/connections/${id}`);
  }

  createConnection(params: {
    workspace: string;
    type: IntegrationType;
    name: string;
    metadata: Record<string, unknown>;
    hidden?: boolean;
  }): Promise<{ connection: Connection }> {
    return this.request('/api/v1/connections', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  updateConnection(
    id: string,
    params: {
      name: string;
      metadata: Record<string, unknown>;
      hidden?: boolean;
    },
  ): Promise<Connection> {
    return this.request(`/api/v1/connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  deleteConnection(
    id: string,
    forceDelete?: boolean,
  ): Promise<{ id: string; type: IntegrationType }> {
    return this.request(`/api/v1/connections/${id}`, {
      method: 'DELETE',
      body: forceDelete ? JSON.stringify({ force_delete: true }) : undefined,
    });
  }

  getConnectionActions(id: string): Promise<unknown> {
    return this.request(`/api/v1/connections/${id}/actions`);
  }

  getConnectionFields(id: string, refresh?: boolean): Promise<unknown> {
    const qs = refresh ? '?refresh=true' : '';
    return this.request(`/api/v1/connections/${id}/fields${qs}`);
  }

  getConnectionDefaultMappings(id: string): Promise<unknown> {
    return this.request(`/api/v1/connections/${id}/mappings/default`);
  }

  // ── Rules ─────────────────────────────────────────────────

  listRules(params?: {
    event?: string;
    resource?: string;
    resource_id?: string;
  }): Promise<PaginatedResponse<Rule>> {
    const query = new URLSearchParams();
    if (params?.event) query.set('event', params.event);
    if (params?.resource) query.set('resource', params.resource);
    if (params?.resource_id) query.set('resource_id', params.resource_id);
    const qs = query.toString();
    return this.request(`/api/v1/rules${qs ? `?${qs}` : ''}`);
  }

  getRule(id: string): Promise<Rule> {
    return this.request(`/api/v1/rules/${id}`);
  }

  createRule(params: {
    workspace: string;
    connection: string;
    event: string;
    metadata: RuleMetadata;
    resource?: string;
    resource_id?: string;
    active?: boolean;
    hidden?: boolean;
  }): Promise<{ rule: Rule }> {
    return this.request('/api/v1/rules', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  deleteRule(id: string): Promise<{
    id: string;
    connection: string;
    type: IntegrationType;
    event: string;
  }> {
    return this.request(`/api/v1/rules/${id}`, { method: 'DELETE' });
  }

  // ── Events ────────────────────────────────────────────────

  listEvents(params?: {
    limit?: number;
    cursor?: string;
  }): Promise<PaginatedResponse<MeshesEvent>> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.cursor) query.set('cursor', params.cursor);
    const qs = query.toString();
    return this.request(`/api/v1/events${qs ? `?${qs}` : ''}`);
  }

  emitEvent(params: {
    workspace: string;
    event: string;
    payload: Record<string, unknown>;
    resource?: string;
    resource_id?: string;
  }): Promise<{
    event: {
      id: string;
      event: string;
      workspace: string;
      created_by: string;
      created_at: string;
    };
  }> {
    return this.request('/api/v1/events', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  emitBulkEvents(
    events: Array<{
      workspace: string;
      event: string;
      payload: Record<string, unknown>;
      resource?: string;
      resource_id?: string;
    }>,
  ): Promise<{ count: number; error_count?: number; records: unknown[] }> {
    return this.request('/api/v1/events/bulk', {
      method: 'POST',
      body: JSON.stringify(events),
    });
  }

  getEvent(id: string): Promise<MeshesEvent> {
    return this.request(`/api/v1/events/${id}`);
  }

  getEventPayload(id: string): Promise<MeshesEvent> {
    return this.request(`/api/v1/events/${id}/payload`);
  }

  retryEventRule(eventId: string, ruleId: string): Promise<RuleEvent> {
    return this.request(`/api/v1/events/${eventId}/rules/${ruleId}/retry`, {
      method: 'POST',
    });
  }

  // ── Integrations ──────────────────────────────────────────

  listIntegrations(): Promise<PaginatedResponse<unknown>> {
    return this.request('/api/v1/integrations');
  }
}
