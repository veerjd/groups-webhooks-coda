export interface CodaRowData {
  cells: Array<{
    column: string;
    value: any;
  }>;
}

export interface CodaApiResponse {
  id: string;
  type: string;
  href: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  values?: Record<string, any>;
}

export interface CodaColumn {
  id: string;
  type: string;
  name: string;
  display?: boolean;
  calculated?: boolean;
}

export interface CodaTable {
  id: string;
  type: string;
  href: string;
  name: string;
  columns?: CodaColumn[];
}