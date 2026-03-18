export const INTEGRATION_TYPES = [
  'activecampaign',
  'aweber',
  'hubspot',
  'intercom',
  'mailchimp',
  'mailerlite',
  'resend',
  'salesforce',
  'slack',
  'webhook',
  'zoom',
] as const;

export type IntegrationType = (typeof INTEGRATION_TYPES)[number];

export const EVENT_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
] as const;

export type EventStatus = 'pending' | 'processing' | 'completed' | 'failed';

export const SESSION_ROLES = ['owner', 'admin', 'member'] as const;

export type SessionRole = (typeof SESSION_ROLES)[number];

export const SESSION_STATUSES = ['active', 'revoked'] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const SESSION_SCOPES = ['events.payload:read'] as const;

export type SessionScope = (typeof SESSION_SCOPES)[number];

export interface PaginatedResponse<T> {
  count: number;
  limit: number;
  next_cursor: string | null;
  records: T[];
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  publishable_key?: { public_key: string; name: string };
}

export interface WorkspaceCatalogEntry {
  id: string;
  key: string;
  label: string;
  description?: string | null;
  active?: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  workspace: string;
  type: IntegrationType;
  name: string;
  metadata: Record<string, unknown>;
  action_data?: Record<string, unknown>;
  hidden: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RuleMetadata {
  action: string;
  id?: string;
  name?: string;
  value?: string;
  key?: string;
  data?: string;
  option?: string;
  option_value?: string;
  [key: string]: string | undefined;
}

export interface Rule {
  id: string;
  connection: string;
  workspace: string;
  type: IntegrationType;
  resource?: string;
  resource_id?: string;
  event: string;
  metadata: RuleMetadata;
  active: boolean;
  hidden: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RuleEvent {
  id: string;
  type: 'rule';
  workspace: string;
  event: string;
  event_id: string;
  resource?: string;
  resource_id?: string;
  connection: string;
  rule: string;
  integration_type: IntegrationType;
  status: EventStatus;
  attempt_count: number;
  started_at?: string;
  completed_at?: string;
  last_error?: string;
  created_by: string;
  created_at: string;
}

export interface MeshesEvent {
  id: string;
  type?: 'event';
  workspace: string;
  event: string;
  resource?: string;
  resource_id?: string;
  status: EventStatus;
  total_rules?: number;
  completed_count?: number;
  failed_count?: number;
  started_at?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  rule_events?: RuleEvent[];
  payload?: Record<string, unknown>;
}

export type MappingScalarValue = string | number | boolean | null;

export interface MappingLiteralSource {
  type: 'literal';
  value: MappingScalarValue;
}

export interface MappingPathSource {
  type: 'path';
  value: string;
}

export type MappingSource = MappingLiteralSource | MappingPathSource;

export interface MappingToStringTransform {
  type: 'to_string';
}

export interface MappingToNumberTransform {
  type: 'to_number';
}

export interface MappingToBooleanTransform {
  type: 'to_boolean';
}

export interface MappingToDateTransform {
  type: 'to_date';
  timezone?: string;
}

export interface MappingToDatetimeTransform {
  type: 'to_datetime';
  timezone?: string;
}

export interface MappingDefaultTransform {
  type: 'default';
  value: MappingScalarValue;
}

export interface MappingTrimTransform {
  type: 'trim';
}

export interface MappingLowerTransform {
  type: 'lower';
}

export interface MappingUpperTransform {
  type: 'upper';
}

export interface MappingSubstringTransform {
  type: 'substring';
  start: number;
  length?: number;
}

export type MappingTransform =
  | MappingToStringTransform
  | MappingToNumberTransform
  | MappingToBooleanTransform
  | MappingToDateTransform
  | MappingToDatetimeTransform
  | MappingDefaultTransform
  | MappingTrimTransform
  | MappingLowerTransform
  | MappingUpperTransform
  | MappingSubstringTransform;

export interface MappingField {
  dest: string;
  source: MappingSource;
  transforms?: MappingTransform[];
  on_error?: 'skip_field' | 'warn_action' | 'fail_action';
  notes?: string;
}

export interface MappingSchema {
  schema_version: 1;
  fields: MappingField[];
  meta?: {
    name?: string;
    notes?: string;
  };
}

export interface ConnectionDefaultMapping {
  id: string;
  mapping_id: string;
  version: number;
  workspace_id: string;
  connection_id: string;
  integration_type: IntegrationType;
  name: string;
  schema: MappingSchema;
  catalog_version?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionDefaultMappingResult {
  status: 'stored' | 'generated';
  mapping: ConnectionDefaultMapping;
}

export interface Session {
  session_id: string;
  access_token: string;
  expires_in: number;
  expires_at: string;
  workspace_id: string;
  role: SessionRole;
}

export interface CreatedSession extends Session {
  launch_token: string;
  launch_expires_at: string;
  launch_url: string;
}

export interface SessionRecord {
  session_id: string;
  workspace_id: string;
  role: string;
  external_user_id?: string;
  status: string;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
}

export interface MeshesConfig {
  accessKey: string;
  secretKey: string;
  orgId: string;
  baseUrl: string;
}
