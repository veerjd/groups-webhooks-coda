import { WebhookHandler } from './handlers/webhook';
import { validateWebhookSignature } from './utils/validation';
import { ErrorResponse, SuccessResponse } from './utils/responses';

export interface Env {
  WEBHOOK_SECRET?: string;
  WEBHOOKS_KV?: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    if (url.pathname !== '/webhook') {
      return new ErrorResponse('Not Found', 404);
    }

    if (request.method !== 'POST') {
      return new ErrorResponse('Method Not Allowed', 405);
    }

    try {
      const rawBody = await request.text();
      
      if (env.WEBHOOK_SECRET) {
        const signature = request.headers.get('X-PCO-Webhook-Signature');
        if (!signature || !validateWebhookSignature(rawBody, signature, env.WEBHOOK_SECRET)) {
          return new ErrorResponse('Unauthorized', 401);
        }
      }

      const payload = JSON.parse(rawBody);
      const handler = new WebhookHandler(env);
      const result = await handler.handle(payload, ctx);
      
      return new SuccessResponse(result);
    } catch (error) {
      console.error('Webhook processing error:', error);
      
      if (error instanceof SyntaxError) {
        return new ErrorResponse('Invalid JSON payload', 400);
      }
      
      return new ErrorResponse('Internal Server Error', 500);
    }
  },
};