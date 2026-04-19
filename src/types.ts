export const INTEGRATION_TYPES = [
  'activecampaign',
  'aweber',
  'customer_io',
  'discord',
  'hubspot',
  'intercom',
  'mailchimp',
  'mailerlite',
  'resend',
  'sendgrid',
  'salesforce',
  'slack',
  'webhook',
  'zoom',
] as const;

export type IntegrationType = (typeof INTEGRATION_TYPES)[number];

export const CONNECTION_INACTIVE_REASONS = [
  'authentication_invalid',
  'oauth_authorization_revoked',
  'oauth_reauthorization_required',
  'manually_inactivated',
] as const;

export type ConnectionInactiveReason =
  (typeof CONNECTION_INACTIVE_REASONS)[number];

export const CONNECTION_FIELD_TYPES = [
  'string',
  'number',
  'boolean',
  'date',
  'datetime',
  'enum',
  'multi_enum',
  'json',
  'object',
  'array',
  'unknown',
] as const;

export type ConnectionFieldType = (typeof CONNECTION_FIELD_TYPES)[number];

export const CONNECTION_FIELD_FORMATS = [
  'email',
  'phone',
  'url',
  'uuid',
  'date',
  'datetime',
  'unknown',
] as const;

export type ConnectionFieldFormat = (typeof CONNECTION_FIELD_FORMATS)[number];

export const INTEGRATION_AUTHENTICATION_TYPES = [
  'api_key',
  'basic',
  'none',
  'oauth',
] as const;

export type IntegrationAuthenticationType =
  (typeof INTEGRATION_AUTHENTICATION_TYPES)[number];

export const INTEGRATION_AUTHENTICATION_FIELD_TYPES = [
  'text',
  'password',
  'select',
] as const;

export type IntegrationAuthenticationFieldType =
  (typeof INTEGRATION_AUTHENTICATION_FIELD_TYPES)[number];

export const INTEGRATION_ACTION_FIELD_TYPES = [
  'text',
  'password',
  'textarea',
  'select',
] as const;

export type IntegrationActionFieldType =
  (typeof INTEGRATION_ACTION_FIELD_TYPES)[number];

export interface IntegrationOption {
  label: string;
  value: string;
}

export interface IntegrationFieldDependency {
  field: string;
  value: string | string[];
}

export interface IntegrationAuthenticationField {
  label: string;
  key: string;
  type: IntegrationAuthenticationFieldType;
  helpText?: string;
  required?: boolean;
  validate?: 'url';
  defaultValue?: string;
  options?: IntegrationOption[];
  dependsOn?: IntegrationFieldDependency;
}

export interface IntegrationAuthenticationBase {
  fields?: IntegrationAuthenticationField[];
}

export interface ApiKeyIntegrationAuthentication
  extends IntegrationAuthenticationBase {
  type: 'api_key';
}

export interface BasicIntegrationAuthentication
  extends IntegrationAuthenticationBase {
  type: 'basic';
}

export interface NoAuthIntegrationAuthentication
  extends IntegrationAuthenticationBase {
  type: 'none';
}

export interface OAuthIntegrationAuthentication
  extends IntegrationAuthenticationBase {
  type: 'oauth';
  oauth: {
    version: 1 | 2;
  };
}

export type IntegrationAuthentication =
  | ApiKeyIntegrationAuthentication
  | BasicIntegrationAuthentication
  | NoAuthIntegrationAuthentication
  | OAuthIntegrationAuthentication;

export interface IntegrationActionDisplay {
  label: string;
  description: string;
}

export interface IntegrationActionSimpleInput {
  key: string;
  field: string;
  kind: 'simple';
  label?: string;
  noun?: string;
  target?: string;
  from?: string;
  required?: boolean;
}

export interface IntegrationActionFieldInput {
  key: string;
  field: string;
  kind: 'field';
  label: string;
  type: IntegrationActionFieldType;
  noun?: string;
  description?: string;
  placeholder?: string;
  regex?: string;
  regexMessage?: string;
  required?: boolean;
  options?: IntegrationOption[];
  defaultValue?: string;
}

export interface IntegrationActionAdvancedOptionDisplay {
  label: string;
  button: string;
  description: string;
}

export interface IntegrationActionAdvancedArrayOption {
  key: string;
  field: string;
  length: number;
  display: IntegrationActionAdvancedOptionDisplay;
  type: 'array';
  entity: 'string';
}

export interface IntegrationActionAdvancedSelectOption {
  key: string;
  field: string;
  length: number;
  display: IntegrationActionAdvancedOptionDisplay;
  type: 'select';
  entity: 'option';
}

export interface IntegrationActionAdvancedInput {
  key: string;
  field: string;
  kind: 'advanced';
  options:
    | IntegrationActionAdvancedArrayOption
    | IntegrationActionAdvancedSelectOption;
  label?: string;
  noun?: string;
  target?: string;
  from?: string;
  required?: boolean;
}

export type IntegrationActionInput =
  | IntegrationActionSimpleInput
  | IntegrationActionFieldInput
  | IntegrationActionAdvancedInput;

export interface IntegrationAction {
  key: string;
  label: string;
  noun: string;
  data?: IntegrationActionInput[];
  fields?: string[];
  display?: IntegrationActionDisplay;
}

export interface Integration {
  name: string;
  type: IntegrationType;
  authentication: IntegrationAuthentication;
  actions: Record<string, IntegrationAction>;
}

export interface ConnectionFieldConstraints {
  format?: ConnectionFieldFormat;
  required?: boolean;
  read_only?: boolean;
  max_length?: number;
  min_length?: number;
  pattern?: string;
  min?: number;
  max?: number;
  allowed_values?: string[];
}

export interface ConnectionFieldDefinition {
  key: string;
  label?: string;
  type: ConnectionFieldType;
  description?: string;
  constraints?: ConnectionFieldConstraints;
  provider_meta?: Record<string, unknown>;
}

export interface ConnectionFieldCatalog {
  id: string;
  workspace_id: string;
  connection_id: string;
  integration_type: IntegrationType;
  catalog_version: string;
  refreshed_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  fields: ConnectionFieldDefinition[];
}

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

export const SESSION_TYPES = ['workspace', 'resource', 'dashboard'] as const;

export type SessionType = (typeof SESSION_TYPES)[number];

export const SESSION_SCOPES = ['events.payload:read'] as const;

export type SessionScope = (typeof SESSION_SCOPES)[number];

export const SESSION_LAUNCH_PAGES = [
  'dashboard',
  'connections',
  'rules',
  'events',
] as const;

export type SessionLaunchPage = (typeof SESSION_LAUNCH_PAGES)[number];

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
  active?: boolean;
  inactive_reason?: ConnectionInactiveReason;
  hidden?: boolean;
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
  session_type: SessionType;
  resource?: string;
  resource_id?: string;
}

export interface CreatedSession extends Session {
  launch_token: string;
  launch_expires_at: string;
  launch_url: string;
}

export interface SessionRecord {
  session_id: string;
  workspace_id: string;
  role: SessionRole;
  external_user_id?: string;
  status: SessionStatus;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
  session_type: SessionType;
  resource?: string;
  resource_id?: string;
}

export interface MeshesConfig {
  accessKey: string;
  secretKey: string;
  orgId: string;
  baseUrl: string;
}
