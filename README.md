# Planning Center Groups Webhook to Coda Integration

A Cloudflare Worker that receives webhooks from Planning Center Groups and automatically creates rows in a Coda table.

## Features

- Receives and validates Planning Center Groups webhooks
- HMAC signature validation for security
- Automatically creates rows in Coda.io table for each webhook event
- Handles all webhook types: groups, memberships, attendance, and events
- TypeScript for type safety
- Cloudflare Worker for serverless deployment

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Coda Table

Create a table in Coda with these columns:
- **Webhook ID** (Text)
- **Action** (Text) 
- **Organization ID** (Text)
- **Timestamp** (Date/Time)
- **Resource Type** (Text)
- **Resource ID** (Text)
- **Name** (Text) - Optional
- **Description** (Text) - Optional
- **Enrollment Strategy** (Text) - Optional
- **Role** (Text) - Optional
- **Person Name** (Text) - Optional
- **Email** (Text) - Optional
- **Event Start** (Date/Time) - Optional
- **Event End** (Date/Time) - Optional
- **Raw Data** (Text) - Stores full JSON payload

### 3. Get Coda API Credentials

1. Get your Coda API token from: https://coda.io/account
2. Find your Doc ID from the Coda doc URL: `https://coda.io/d/YOUR_DOC_ID/...`
3. Find your Table ID using the Coda API or from the table settings

### 4. Configure Environment Variables

Update `wrangler.toml`:
```toml
[vars]
CODA_DOC_ID = "your-doc-id"
CODA_TABLE_ID = "your-table-id"
```

Set secrets:
```bash
# Required: Coda API Token
wrangler secret put CODA_API_TOKEN

# Optional: Planning Center webhook signature validation
wrangler secret put WEBHOOK_SECRET
```

### 5. Deploy

```bash
# Development
npm run dev

# Production
npm run deploy
```

## Webhook Endpoint

Once deployed, your webhook endpoint will be:
```
https://your-worker-name.your-subdomain.workers.dev/webhook
```

Configure this URL in Planning Center Groups webhook settings.

## Supported Webhook Events

- `group.created` / `group.updated` / `group.deleted`
- `membership.created` / `membership.updated` / `membership.deleted`
- `attendance.created` / `attendance.updated`
- `event.created` / `event.updated` / `event.deleted`

## Development

```bash
# Run locally
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

## Security

- HMAC signature validation (when `WEBHOOK_SECRET` is configured)
- Coda API token stored as encrypted secret
- All webhook payloads validated before processing

## Error Handling

- Failed Coda API calls are logged but don't fail the webhook response
- Invalid payloads return 400 Bad Request
- Missing signature (when configured) returns 401 Unauthorized
- All errors are logged for debugging