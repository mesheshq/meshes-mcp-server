import {
  type MeshesOptionalRequestOptions,
  MeshesApiClient as MeshesSdkClient,
} from '@mesheshq/api';
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

  getWorkspaceRules(id: string): Promise<PaginatedResponse<Rule>> {
    return this.request(`/workspaces/${id}/rules`);
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
    return this.request(`/workspaces/${id}/events${qs ? `?${qs}` : ''}`);
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
    return this.request(`/rules${qs ? `?${qs}` : ''}`);
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
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.cursor) query.set('cursor', params.cursor);
    const qs = query.toString();
    return this.request(`/events${qs ? `?${qs}` : ''}`);
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
}
