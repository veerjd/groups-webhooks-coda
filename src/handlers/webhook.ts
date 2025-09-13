import { Env } from '../index';
import { WebhookPayload } from '../types/planning-center';
import { isValidWebhookPayload } from '../utils/validation';
import { createCodaClient } from '../utils/coda-client';
import { Logger } from '../utils/logger';

export function createWebhookHandler(env: Env) {
  const codaClient = createCodaClient(
    env.CODA_API_TOKEN,
    env.CODA_DOC_ID,
    env.CODA_TABLE_ID
  );

  const handleGroupCreated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const group = payload.payload.data;
    Logger.logDetailedPayload('Group Created - Full Data', group);
    console.log(`New group created: ${group.attributes.name} (ID: ${group.id})`)
    
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
    Logger.logDetailedPayload('Group Updated - Full Data', group);
    console.log(`Group updated: ${group.attributes.name} (ID: ${group.id})`)
    
    return {
      action: 'group.updated',
      groupId: group.id,
      groupName: group.attributes.name,
      processed: true
    };
  };

  const handleGroupDeleted = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const group = payload.payload.data;
    Logger.logDetailedPayload('Group Deleted - Full Data', group);
    console.log(`Group deleted: ID ${group.id}`)
    
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
    Logger.logDetailedPayload('Membership Created - Full Data', membership);
    console.log(`New membership created: ID ${membership.id}`)
    
    return {
      action: 'membership.created',
      membershipId: membership.id,
      role: membership.attributes.role,
      processed: true
    };
  };

  const handleMembershipUpdated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const membership = payload.payload.data;
    Logger.logDetailedPayload('Membership Updated - Full Data', membership);
    console.log(`Membership updated: ID ${membership.id}`)
    
    return {
      action: 'membership.updated',
      membershipId: membership.id,
      processed: true
    };
  };

  const handleMembershipDeleted = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const membership = payload.payload.data;
    Logger.logDetailedPayload('Membership Deleted - Full Data', membership);
    console.log(`Membership deleted: ID ${membership.id}`)
    
    return {
      action: 'membership.deleted',
      membershipId: membership.id,
      processed: true
    };
  };

  const handleAttendanceCreated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const attendance = payload.payload.data;
    Logger.logDetailedPayload('Attendance Created - Full Data', attendance);
    console.log(`Attendance recorded: ID ${attendance.id}`)
    
    return {
      action: 'attendance.created',
      attendanceId: attendance.id,
      processed: true
    };
  };

  const handleEventCreated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const event = payload.payload.data;
    Logger.logDetailedPayload('Event Created - Full Data', event);
    console.log(`Event created: ${event.attributes.name} (ID: ${event.id})`)
    
    return {
      action: 'event.created',
      eventId: event.id,
      eventName: event.attributes.name,
      processed: true
    };
  };

  const handleEventUpdated = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const event = payload.payload.data;
    Logger.logDetailedPayload('Event Updated - Full Data', event);
    console.log(`Event updated: ${event.attributes.name} (ID: ${event.id})`)
    
    return {
      action: 'event.updated',
      eventId: event.id,
      eventName: event.attributes.name,
      processed: true
    };
  };

  const handleEventDeleted = async (payload: WebhookPayload, _ctx: ExecutionContext) => {
    const event = payload.payload.data;
    Logger.logDetailedPayload('Event Deleted - Full Data', event);
    console.log(`Event deleted: ID ${event.id}`)
    
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

    Logger.logWebhookProcessing(payload.action, payload.organization_id);
    
    // Log the main data object
    if (payload.payload?.data) {
      Logger.logDetailedPayload('Main Webhook Data Object', {
        type: payload.payload.data.type,
        id: payload.payload.data.id,
        attributes: payload.payload.data.attributes,
        relationships: payload.payload.data.relationships
      });
    }
    
    // Log full payload details including relationships and included data
    if (payload.payload?.included) {
      Logger.logDetailedPayload('Included Relationships Data', payload.payload.included);
    }
    
    // Log any additional metadata if present in the payload structure
    if ((payload as any).meta) {
      Logger.logDetailedPayload('Webhook Metadata', (payload as any).meta);
    }
    
    // Create row in Coda for all webhook events
    try {
      const rowData = codaClient.formatWebhookForCoda(payload);
      await codaClient.createRow(rowData);
      console.log('Successfully created row in Coda');
    } catch (error) {
      Logger.logWebhookError(error, 'Coda Row Creation Failed');
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