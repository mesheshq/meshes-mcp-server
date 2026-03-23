import {
  type MeshesOptionalRequestOptions,
  MeshesApiClient as MeshesSdkClient,
} from '@mesheshq/api';
import type {
  Connection,
  ConnectionDefaultMappingResult,
  CreatedSession,
  EventStatus,
  IntegrationType,
  MappingSchema,
  MeshesConfig,
  MeshesEvent,
  PaginatedResponse,
  Rule,
  RuleEvent,
  RuleMetadata,
  Session,
  SessionLaunchPage,
  SessionRecord,
  SessionRole,
  SessionScope,
  SessionStatus,
  SessionType,
  Workspace,
  WorkspaceCatalogEntry,
} from './types.js';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function normalizeApiBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, '');
  return /\/api\/v\d+$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
}

function formatApiErrorDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (detail === null || detail === undefined) return 'Unknown error';
  try {
    return JSON.stringify(detail);
  } catch {
    return String(detail);
  }
}

function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  }

  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export class MeshesApiClient {
  private apiClient: MeshesSdkClient;

  constructor(config: MeshesConfig) {
    this.apiClient = new MeshesSdkClient(
      config.orgId,
      config.accessKey,
      config.secretKey,
      { apiBaseUrl: normalizeApiBaseUrl(config.baseUrl) },
    );
  }

  private async request<T>(
    path: string,
    options: { method?: RequestMethod; body?: unknown } = {},
  ): Promise<T> {
    const method = options.method || 'GET';

    try {
      switch (method) {
        case 'GET':
          return (await this.apiClient.get<T>(path)) as T;
        case 'POST':
          return (await this.apiClient.post<T, unknown>(
            path,
            options.body,
          )) as T;
        case 'PUT':
          return (await this.apiClient.put<T, unknown>(
            path,
            options.body,
          )) as T;
        case 'DELETE': {
          const deleteOptions =
            options.body === undefined
              ? undefined
              : ({
                  body: options.body,
                } as unknown as MeshesOptionalRequestOptions);
          return (await this.apiClient.delete<T>(path, deleteOptions)) as T;
        }
      }
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'data' in error &&
        typeof (error as { data?: unknown }).data === 'object' &&
        (error as { data?: { status?: unknown } }).data
      ) {
        const data = (
          error as {
            data?: { status?: number; statusText?: string; data?: unknown };
          }
        ).data;
        if (data?.status) {
          const detail = formatApiErrorDetail(data.data ?? data.statusText);
          throw new Error(`Meshes API ${data.status}: ${detail}`);
        }
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  // ── Workspaces ────────────────────────────────────────────

  listWorkspaces(): Promise<PaginatedResponse<Workspace>> {
    return this.request('/workspaces');
  }

  getWorkspace(id: string): Promise<Workspace> {
    return this.request(`/workspaces/${id}`);
  }

  createWorkspace(params: {
    name: string;
    description?: string;
  }): Promise<{ workspace: Workspace }> {
    return this.request('/workspaces', {
      method: 'POST',
      body: params,
    });
  }

  updateWorkspace(
    id: string,
    params: { name: string; description?: string | null },
  ): Promise<Workspace> {
    return this.request(`/workspaces/${id}`, {
      method: 'PUT',
      body: params,
    });
  }

  getWorkspaceConnections(id: string): Promise<PaginatedResponse<Connection>> {
    return this.request(`/workspaces/${id}/connections`);
  }

  getWorkspaceRules(
    id: string,
    params?: {
      event?: string;
      resource?: string;
      resource_id?: string;
    },
  ): Promise<PaginatedResponse<Rule>> {
    return this.request(
      `/workspaces/${id}/rules${buildQueryString({
        event: params?.event,
        resource: params?.resource,
        resource_id: params?.resource_id,
      })}`,
    );
  }

  getWorkspaceEventTypes(id: string): Promise<WorkspaceCatalogEntry[]> {
    return this.request(`/workspaces/${id}/event-types`);
  }

  getWorkspaceResources(id: string): Promise<WorkspaceCatalogEntry[]> {
    return this.request(`/workspaces/${id}/resources`);
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
    return this.request(
      `/workspaces/${id}/events${buildQueryString({
        limit: params?.limit,
        cursor: params?.cursor,
        event: params?.event,
        status: params?.status,
        resource: params?.resource,
        resource_id: params?.resource_id,
      })}`,
    );
  }

  // ── Connections ───────────────────────────────────────────

  listConnections(): Promise<PaginatedResponse<Connection>> {
    return this.request('/connections');
  }

  getConnection(id: string): Promise<Connection> {
    return this.request(`/connections/${id}`);
  }

  createConnection(params: {
    workspace: string;
    type: IntegrationType;
    name: string;
    metadata: Record<string, unknown>;
    hidden?: boolean;
  }): Promise<{ connection: Connection }> {
    return this.request('/connections', {
      method: 'POST',
      body: params,
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
    return this.request(`/connections/${id}`, {
      method: 'PUT',
      body: params,
    });
  }

  deleteConnection(
    id: string,
    forceDelete?: boolean,
  ): Promise<{ id: string; type: IntegrationType }> {
    return this.request(`/connections/${id}`, {
      method: 'DELETE',
      body: forceDelete ? { force_delete: true } : undefined,
    });
  }

  getConnectionActions(id: string): Promise<unknown> {
    return this.request(`/connections/${id}/actions`);
  }

  getConnectionFields(id: string, refresh?: boolean): Promise<unknown> {
    const qs = refresh ? '?refresh=true' : '';
    return this.request(`/connections/${id}/fields${qs}`);
  }

  getConnectionDefaultMappings(id: string): Promise<unknown> {
    return this.request(`/connections/${id}/mappings/default`);
  }

  updateConnectionDefaultMappings(
    id: string,
    params: {
      workspace_id?: string;
      mapping_id?: string;
      expected_version?: number;
      name?: string;
      schema: MappingSchema;
    },
  ): Promise<ConnectionDefaultMappingResult> {
    return this.request(`/connections/${id}/mappings/default`, {
      method: 'PUT',
      body: params,
    });
  }

  // ── Rules ─────────────────────────────────────────────────

  listRules(params?: {
    event?: string;
    resource?: string;
    resource_id?: string;
  }): Promise<PaginatedResponse<Rule>> {
    return this.request(
      `/rules${buildQueryString({
        event: params?.event,
        resource: params?.resource,
        resource_id: params?.resource_id,
      })}`,
    );
  }

  getRule(id: string): Promise<Rule> {
    return this.request(`/rules/${id}`);
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
    return this.request('/rules', {
      method: 'POST',
      body: params,
    });
  }

  deleteRule(id: string): Promise<{
    id: string;
    connection: string;
    type: IntegrationType;
    event: string;
  }> {
    return this.request(`/rules/${id}`, { method: 'DELETE' });
  }

  // ── Events ────────────────────────────────────────────────

  listEvents(params?: {
    limit?: number;
    cursor?: string;
  }): Promise<PaginatedResponse<MeshesEvent>> {
    return this.request(
      `/events${buildQueryString({
        limit: params?.limit,
        cursor: params?.cursor,
      })}`,
    );
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
    return this.request('/events', {
      method: 'POST',
      body: params,
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
    return this.request('/events/bulk', {
      method: 'POST',
      body: events,
    });
  }

  getEvent(id: string): Promise<MeshesEvent> {
    return this.request(`/events/${id}`);
  }

  getEventPayload(id: string): Promise<MeshesEvent> {
    return this.request(`/events/${id}/payload`);
  }

  retryEventRule(eventId: string, ruleId: string): Promise<RuleEvent> {
    return this.request(`/events/${eventId}/rules/${ruleId}/retry`, {
      method: 'POST',
    });
  }

  // ── Integrations ──────────────────────────────────────────

  listIntegrations(): Promise<PaginatedResponse<unknown>> {
    return this.request('/integrations');
  }

  // ── Sessions ──────────────────────────────────────────────

  createSession(params: {
    workspace_id: string;
    role?: SessionRole;
    session_type?: SessionType;
    external_user_id?: string;
    ttl_seconds?: number;
    launch_ttl_seconds?: number;
    launch_page?: SessionLaunchPage;
    resource?: string;
    resource_id?: string;
    allowed_origins?: string[];
    scopes?: SessionScope[];
  }): Promise<CreatedSession> {
    return this.request('/sessions', {
      method: 'POST',
      body: params,
    });
  }

  listSessions(params: {
    workspace_id: string;
    limit?: number;
    cursor?: string;
    status?: SessionStatus;
    resource?: string;
    resource_id?: string;
  }): Promise<PaginatedResponse<SessionRecord>> {
    return this.request(
      `/sessions${buildQueryString({
        workspace_id: params.workspace_id,
        limit: params.limit,
        cursor: params.cursor,
        status: params.status,
        resource: params.resource,
        resource_id: params.resource_id,
      })}`,
    );
  }

  refreshSession(sessionId: string): Promise<Session> {
    return this.request(`/sessions/${sessionId}/refresh`, {
      method: 'POST',
    });
  }

  revokeSession(sessionId: string): Promise<{ revoked: boolean }> {
    return this.request(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }
}
