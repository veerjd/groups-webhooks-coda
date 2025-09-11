import { WebhookPayload } from '../types/planning-center';

export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const key = encoder.encode(secret);
  
  return crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  ).then(cryptoKey => 
    crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      hexToArrayBuffer(signature),
      data
    )
  ).catch(() => false) as unknown as boolean;
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

export function isValidWebhookPayload(payload: any): payload is WebhookPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.id === 'string' &&
    typeof payload.action === 'string' &&
    typeof payload.created_at === 'string' &&
    typeof payload.organization_id === 'string' &&
    payload.payload &&
    typeof payload.payload === 'object' &&
    payload.payload.data &&
    typeof payload.payload.data === 'object'
  );
}