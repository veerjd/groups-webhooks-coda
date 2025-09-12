export class Logger {
  private static formatPayload(data: any): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return `[Unable to stringify: ${error}]`;
    }
  }

  static logWebhookReceived(request: Request, payload: any): void {
    const timestamp = new Date().toISOString();
    const headers: Record<string, string> = {};
    
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`[${timestamp}] WEBHOOK RECEIVED`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('REQUEST INFO:');
    console.log(`  Method: ${request.method}`);
    console.log(`  URL: ${request.url}`);
    console.log('  Headers:', this.formatPayload(headers));
    console.log('───────────────────────────────────────────────────────────');
    console.log('FULL PAYLOAD:');
    console.log(this.formatPayload(payload));
    console.log('═══════════════════════════════════════════════════════════');
  }

  static logWebhookProcessing(action: string, organizationId: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Processing webhook action: ${action} for organization: ${organizationId}`);
  }

  static logWebhookSuccess(result: any): void {
    const timestamp = new Date().toISOString();
    console.log('───────────────────────────────────────────────────────────');
    console.log(`[${timestamp}] WEBHOOK PROCESSED SUCCESSFULLY`);
    console.log('Result:', this.formatPayload(result));
    console.log('═══════════════════════════════════════════════════════════');
  }

  static logWebhookError(error: any, context?: string): void {
    const timestamp = new Date().toISOString();
    console.error('───────────────────────────────────────────────────────────');
    console.error(`[${timestamp}] WEBHOOK ERROR${context ? ` (${context})` : ''}`);
    console.error('Error Details:', error);
    if (error instanceof Error) {
      console.error('Stack Trace:', error.stack);
    }
    console.error('═══════════════════════════════════════════════════════════');
  }

  static logDetailedPayload(label: string, data: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${label}:`, this.formatPayload(data));
  }
}