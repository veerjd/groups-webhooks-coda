import { Env } from '../index';
import { WebhookPayload } from '../types/planning-center';
import { isValidWebhookPayload } from '../utils/validation';
import { createCodaClient } from '../utils/coda-client';

export function createWebhookHandler(env: Env) {
  const codaClient = createCodaClient(
    env.CODA_API_TOKEN,
    env.CODA_DOC_ID,
    env.CODA_TABLE_ID
  );

  const handleGroupCreated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const group = payload.payload.data;
    console.log(`New group created: ${group.attributes.name} (ID: ${group.id})`);
    
    if (env.WEBHOOKS_KV) {
      await env.WEBHOOKS_KV.put(
        `group:${group.id}`,
        JSON.stringify(group),
        { expirationTtl: 86400 }
      );
    }
    
    return {
      action: 'group.created',
      groupId: group.id,
      groupName: group.attributes.name,
      processed: true
    };
  };

  const handleGroupUpdated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const group = payload.payload.data;
    console.log(`Group updated: ${group.attributes.name} (ID: ${group.id})`);
    
    return {
      action: 'group.updated',
      groupId: group.id,
      groupName: group.attributes.name,
      processed: true
    };
  };

  const handleGroupDeleted = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const group = payload.payload.data;
    console.log(`Group deleted: ID ${group.id}`);
    
    if (env.WEBHOOKS_KV) {
      await env.WEBHOOKS_KV.delete(`group:${group.id}`);
    }
    
    return {
      action: 'group.deleted',
      groupId: group.id,
      processed: true
    };
  };

  const handleMembershipCreated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const membership = payload.payload.data;
    console.log(`New membership created: ID ${membership.id}`);
    
    return {
      action: 'membership.created',
      membershipId: membership.id,
      role: membership.attributes.role,
      processed: true
    };
  };

  const handleMembershipUpdated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const membership = payload.payload.data;
    console.log(`Membership updated: ID ${membership.id}`);
    
    return {
      action: 'membership.updated',
      membershipId: membership.id,
      processed: true
    };
  };

  const handleMembershipDeleted = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const membership = payload.payload.data;
    console.log(`Membership deleted: ID ${membership.id}`);
    
    return {
      action: 'membership.deleted',
      membershipId: membership.id,
      processed: true
    };
  };

  const handleAttendanceCreated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const attendance = payload.payload.data;
    console.log(`Attendance recorded: ID ${attendance.id}`);
    
    return {
      action: 'attendance.created',
      attendanceId: attendance.id,
      processed: true
    };
  };

  const handleEventCreated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const event = payload.payload.data;
    console.log(`Event created: ${event.attributes.name} (ID: ${event.id})`);
    
    return {
      action: 'event.created',
      eventId: event.id,
      eventName: event.attributes.name,
      processed: true
    };
  };

  const handleEventUpdated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const event = payload.payload.data;
    console.log(`Event updated: ${event.attributes.name} (ID: ${event.id})`);
    
    return {
      action: 'event.updated',
      eventId: event.id,
      eventName: event.attributes.name,
      processed: true
    };
  };

  const handleEventDeleted = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const event = payload.payload.data;
    console.log(`Event deleted: ID ${event.id}`);
    
    return {
      action: 'event.deleted',
      eventId: event.id,
      processed: true
    };
  };

  const handle = async (payload: any, ctx: ExecutionContext): Promise<any> => {
    if (!isValidWebhookPayload(payload)) {
      throw new Error('Invalid webhook payload structure');
    }

    console.log(`Processing webhook: ${payload.action} for org ${payload.organization_id}`);
    
    // Create row in Coda for all webhook events
    try {
      const rowData = codaClient.formatWebhookForCoda(payload);
      await codaClient.createRow(rowData);
      console.log('Successfully created row in Coda');
    } catch (error) {
      console.error('Failed to create Coda row:', error);
      // Don't throw - we still want to process the webhook even if Coda fails
    }

    switch (payload.action) {
      case 'group.created':
        return await handleGroupCreated(payload, ctx);
      case 'group.updated':
        return await handleGroupUpdated(payload, ctx);
      case 'group.deleted':
        return await handleGroupDeleted(payload, ctx);
      case 'membership.created':
        return await handleMembershipCreated(payload, ctx);
      case 'membership.updated':
        return await handleMembershipUpdated(payload, ctx);
      case 'membership.deleted':
        return await handleMembershipDeleted(payload, ctx);
      case 'attendance.created':
        return await handleAttendanceCreated(payload, ctx);
      case 'event.created':
        return await handleEventCreated(payload, ctx);
      case 'event.updated':
        return await handleEventUpdated(payload, ctx);
      case 'event.deleted':
        return await handleEventDeleted(payload, ctx);
      default:
        console.warn(`Unhandled webhook action: ${payload.action}`);
        return { message: `Webhook received but action '${payload.action}' is not handled` };
    }
  };

  return {
    handle
  };
}