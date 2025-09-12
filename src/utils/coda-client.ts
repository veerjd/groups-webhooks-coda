import { CodaRowData, CodaApiResponse } from '../types/coda';
import { WebhookPayload } from '../types/planning-center';

export function createCodaClient(
  apiToken: string,
  docId: string,
  tableId: string
) {
  const baseUrl = 'https://coda.io/apis/v1';

  const formatAttributes = (attributes: Record<string, any>): Array<{ column: string; value: any }> => {
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
  };

  const createRow = async (rowData: CodaRowData): Promise<CodaApiResponse> => {
    const url = `${baseUrl}/docs/${docId}/tables/${tableId}/rows`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
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
  };

  const formatWebhookForCoda = (webhook: WebhookPayload): CodaRowData => {
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

    const attributeColumns = formatAttributes(data.attributes);
    
    const rawDataColumn = {
      column: 'Raw Data',
      value: JSON.stringify(webhook, null, 2)
    };

    return {
      cells: [...baseColumns, ...attributeColumns, rawDataColumn]
    };
  };

  const testConnection = async (): Promise<boolean> => {
    const url = `${baseUrl}/docs/${docId}/tables/${tableId}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Coda connection test failed:', error);
      return false;
    }
  };

  return {
    createRow,
    formatWebhookForCoda,
    testConnection
  };
}