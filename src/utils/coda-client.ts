import { CodaRowData, CodaApiResponse } from '../types/coda';
import { WebhookPayload } from '../types/planning-center';

export class CodaClient {
  private baseUrl = 'https://coda.io/apis/v1';
  
  constructor(
    private apiToken: string,
    private docId: string,
    private tableId: string
  ) {}

  async createRow(rowData: CodaRowData): Promise<CodaApiResponse> {
    const url = `${this.baseUrl}/docs/${this.docId}/tables/${this.tableId}/rows`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rows: [rowData]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Coda API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  formatWebhookForCoda(webhook: WebhookPayload): CodaRowData {
    const data = webhook.payload.data;
    const timestamp = new Date(webhook.created_at).toISOString();
    
    const baseColumns = [
      { column: 'Webhook ID', value: webhook.id },
      { column: 'Action', value: webhook.action },
      { column: 'Organization ID', value: webhook.organization_id },
      { column: 'Timestamp', value: timestamp },
      { column: 'Resource Type', value: data.type },
      { column: 'Resource ID', value: data.id },
    ];

    const attributeColumns = this.formatAttributes(data.attributes);
    
    const rawDataColumn = {
      column: 'Raw Data',
      value: JSON.stringify(webhook, null, 2)
    };

    return {
      cells: [...baseColumns, ...attributeColumns, rawDataColumn]
    };
  }

  private formatAttributes(attributes: Record<string, any>): Array<{ column: string; value: any }> {
    const columns: Array<{ column: string; value: any }> = [];
    
    if (attributes.name) {
      columns.push({ column: 'Name', value: attributes.name });
    }
    
    if (attributes.description) {
      columns.push({ column: 'Description', value: attributes.description });
    }
    
    if (attributes.enrollment_strategy) {
      columns.push({ column: 'Enrollment Strategy', value: attributes.enrollment_strategy });
    }
    
    if (attributes.role) {
      columns.push({ column: 'Role', value: attributes.role });
    }
    
    if (attributes.first_name && attributes.last_name) {
      columns.push({ 
        column: 'Person Name', 
        value: `${attributes.first_name} ${attributes.last_name}` 
      });
    }
    
    if (attributes.email) {
      columns.push({ column: 'Email', value: attributes.email });
    }
    
    if (attributes.starts_at) {
      columns.push({ column: 'Event Start', value: attributes.starts_at });
    }
    
    if (attributes.ends_at) {
      columns.push({ column: 'Event End', value: attributes.ends_at });
    }

    return columns;
  }

  async testConnection(): Promise<boolean> {
    const url = `${this.baseUrl}/docs/${this.docId}/tables/${this.tableId}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Coda connection test failed:', error);
      return false;
    }
  }
}