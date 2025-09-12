import { createWebhookHandler } from './handlers/webhook';
import { validateWebhookSignature } from './utils/validation';
import { createErrorResponse, createSuccessResponse } from './utils/responses';

export interface Env {
  WEBHOOK_SECRET?: string;
  WEBHOOKS_KV?: KVNamespace;
  CODA_API_TOKEN: string;
  CODA_DOC_ID: string;
  CODA_TABLE_ID: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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
          return createErrorResponse('Unauthorized', 401);
        }
      }

      const payload = JSON.parse(rawBody);
      const handler = createWebhookHandler(env);
      const result = await handler.handle(payload, ctx);
      
      return createSuccessResponse(result);
    } catch (error) {
      console.error('Webhook processing error:', error);
      
      if (error instanceof SyntaxError) {
        return createErrorResponse('Invalid JSON payload', 400);
      }
      
      return createErrorResponse('Internal Server Error', 500);
    }
  },
};