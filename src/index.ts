import { createWebhookHandler } from './handlers/webhook';
import { validateWebhookSignature } from './utils/validation';
import { createErrorResponse, createSuccessResponse } from './utils/responses';
import { Logger } from './utils/logger';

export interface Env {
  WEBHOOK_SECRET?: string;
  WEBHOOKS_KV?: KVNamespace;
  CODA_API_TOKEN: string;
  CODA_DOC_ID: string;
  CODA_TABLE_ID: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Log full request details
    Logger.logDetailedPayload('Incoming Request', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      cf: request.cf,
      request
    });
    
    const url = new URL(request.url);
    
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    if (url.pathname !== '/webhook') {
      return createErrorResponse('Not Found', 404);
    }

    if (request.method !== 'POST') {
      return createErrorResponse('Method Not Allowed', 405);
    }

    try {
      const rawBody = await request.text();
      
      if (env.WEBHOOK_SECRET) {
        const signature = request.headers.get('X-PCO-Webhook-Signature');
        if (!signature || !validateWebhookSignature(rawBody, signature, env.WEBHOOK_SECRET)) {
          Logger.logWebhookError('Invalid signature', 'Authentication Failed');
          return createErrorResponse('Unauthorized', 401);
        }
      }

      const payload = JSON.parse(rawBody);
      
      // Log the full webhook payload and request details
      Logger.logWebhookReceived(request, payload);
      
      const handler = createWebhookHandler(env);
      const result = await handler.handle(payload, ctx);
      
      // Log successful processing
      Logger.logWebhookSuccess(result);
      
      return createSuccessResponse(result);
    } catch (error) {
      Logger.logWebhookError(error, 'Webhook Processing Failed');
      
      if (error instanceof SyntaxError) {
        return createErrorResponse('Invalid JSON payload', 400);
      }
      
      return createErrorResponse('Internal Server Error', 500);
    }
  },
};