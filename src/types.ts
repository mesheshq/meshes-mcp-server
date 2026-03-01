export type IntegrationType =
  | "activecampaign"
  | "aweber"
  | "hubspot"
  | "intercom"
  | "mailchimp"
  | "mailerlite"
  | "resend"
  | "salesforce"
  | "webhook"
  | "zoom";

export type EventStatus = "pending" | "processing" | "completed" | "failed";

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
  type: "rule";
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
  type?: "event";
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

export interface MeshesConfig {
  accessKey: string;
  secretKey: string;
  orgId: string;
  baseUrl: string;
}
