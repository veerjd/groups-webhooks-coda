export interface WebhookPayload {
  id: string;
  action: WebhookAction;
  payload: {
    data: WebhookData;
    included?: IncludedResource[];
  };
  created_at: string;
  organization_id: string;
}

export type WebhookAction = 
  | 'group.created'
  | 'group.updated'
  | 'group.deleted'
  | 'membership.created'
  | 'membership.updated'
  | 'membership.deleted'
  | 'attendance.created'
  | 'attendance.updated'
  | 'event.created'
  | 'event.updated'
  | 'event.deleted';

export interface WebhookData {
  type: string;
  id: string;
  attributes: Record<string, any>;
  relationships?: Record<string, Relationship>;
  links?: {
    self?: string;
  };
}

export interface Relationship {
  data: {
    type: string;
    id: string;
  } | Array<{
    type: string;
    id: string;
  }>;
}

export interface IncludedResource {
  type: string;
  id: string;
  attributes: Record<string, any>;
  relationships?: Record<string, Relationship>;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  enrollment_strategy?: 'open' | 'request_to_join' | 'closed';
  group_type_id?: string;
  location_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  person_id: string;
  group_id: string;
  role: 'member' | 'leader';
  joined_at: string;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
}

export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
}