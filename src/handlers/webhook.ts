import { Env } from '../index';
import { WebhookPayload } from '../types/planning-center';
import { isValidWebhookPayload } from '../utils/validation';

export class WebhookHandler {
  constructor(private env: Env) {}

  async handle(payload: any, ctx: ExecutionContext): Promise<any> {
    if (!isValidWebhookPayload(payload)) {
      throw new Error('Invalid webhook payload structure');
    }

    console.log(`Processing webhook: ${payload.action} for org ${payload.organization_id}`);

    switch (payload.action) {
      case 'group.created':
        return await this.handleGroupCreated(payload, ctx);
      case 'group.updated':
        return await this.handleGroupUpdated(payload, ctx);
      case 'group.deleted':
        return await this.handleGroupDeleted(payload, ctx);
      case 'membership.created':
        return await this.handleMembershipCreated(payload, ctx);
      case 'membership.updated':
        return await this.handleMembershipUpdated(payload, ctx);
      case 'membership.deleted':
        return await this.handleMembershipDeleted(payload, ctx);
      case 'attendance.created':
        return await this.handleAttendanceCreated(payload, ctx);
      case 'event.created':
        return await this.handleEventCreated(payload, ctx);
      case 'event.updated':
        return await this.handleEventUpdated(payload, ctx);
      case 'event.deleted':
        return await this.handleEventDeleted(payload, ctx);
      default:
        console.warn(`Unhandled webhook action: ${payload.action}`);
        return { message: `Webhook received but action '${payload.action}' is not handled` };
    }
  }

  private async handleGroupCreated(payload: WebhookPayload, _ctx: ExecutionContext) {
    const group = payload.payload.data;
    console.log(`New group created: ${group.attributes.name} (ID: ${group.id})`);
    
    if (this.env.WEBHOOKS_KV) {
      await this.env.WEBHOOKS_KV.put(
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
  }

  private async handleGroupUpdated(payload: WebhookPayload, _ctx: ExecutionContext) {
    const group = payload.payload.data;
    console.log(`Group updated: ${group.attributes.name} (ID: ${group.id})`);
    
    return {
      action: 'group.updated',
      groupId: group.id,
      groupName: group.attributes.name,
      processed: true
    };
  }

  private async handleGroupDeleted(payload: WebhookPayload, _ctx: ExecutionContext) {
    const group = payload.payload.data;
    console.log(`Group deleted: ID ${group.id}`);
    
    if (this.env.WEBHOOKS_KV) {
      await this.env.WEBHOOKS_KV.delete(`group:${group.id}`);
    }
    
    return {
      action: 'group.deleted',
      groupId: group.id,
      processed: true
    };
  }

  private async handleMembershipCreated(payload: WebhookPayload, _ctx: ExecutionContext) {
    const membership = payload.payload.data;
    console.log(`New membership created: ID ${membership.id}`);
    
    return {
      action: 'membership.created',
      membershipId: membership.id,
      role: membership.attributes.role,
      processed: true
    };
  }

  private async handleMembershipUpdated(payload: WebhookPayload, _ctx: ExecutionContext) {
    const membership = payload.payload.data;
    console.log(`Membership updated: ID ${membership.id}`);
    
    return {
      action: 'membership.updated',
      membershipId: membership.id,
      processed: true
    };
  }

  private async handleMembershipDeleted(payload: WebhookPayload, _ctx: ExecutionContext) {
    const membership = payload.payload.data;
    console.log(`Membership deleted: ID ${membership.id}`);
    
    return {
      action: 'membership.deleted',
      membershipId: membership.id,
      processed: true
    };
  }

  private async handleAttendanceCreated(payload: WebhookPayload, _ctx: ExecutionContext) {
    const attendance = payload.payload.data;
    console.log(`Attendance recorded: ID ${attendance.id}`);
    
    return {
      action: 'attendance.created',
      attendanceId: attendance.id,
      processed: true
    };
  }

  private async handleEventCreated(payload: WebhookPayload, _ctx: ExecutionContext) {
    const event = payload.payload.data;
    console.log(`Event created: ${event.attributes.name} (ID: ${event.id})`);
    
    return {
      action: 'event.created',
      eventId: event.id,
      eventName: event.attributes.name,
      processed: true
    };
  }

  private async handleEventUpdated(payload: WebhookPayload, _ctx: ExecutionContext) {
    const event = payload.payload.data;
    console.log(`Event updated: ${event.attributes.name} (ID: ${event.id})`);
    
    return {
      action: 'event.updated',
      eventId: event.id,
      eventName: event.attributes.name,
      processed: true
    };
  }

  private async handleEventDeleted(payload: WebhookPayload, _ctx: ExecutionContext) {
    const event = payload.payload.data;
    console.log(`Event deleted: ID ${event.id}`);
    
    return {
      action: 'event.deleted',
      eventId: event.id,
      processed: true
    };
  }
}