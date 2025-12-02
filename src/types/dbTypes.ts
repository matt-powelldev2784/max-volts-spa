import type { Database } from './database.types';

// table row types
export type Client = Database['public']['Tables']['client']['Row'];
export type Quote = Database['public']['Tables']['quote']['Row'];
export type Invoice = Database['public']['Tables']['invoice']['Row'];
export type Product = Database['public']['Tables']['product']['Row'];
export type QuoteProduct = Database['public']['Tables']['quote_product']['Row'];
export type InvoiceProduct = Database['public']['Tables']['invoice_product']['Row'];

// insert types with omitted fields
type ProductInsertAllFields = Database['public']['Tables']['product']['Insert'];
export type ProductInsert = Omit<ProductInsertAllFields, 'id' | 'created_at' | 'updated_at'>;

type ClientInsertAllFields = Database['public']['Tables']['client']['Insert'];
export type ClientInsert = Omit<ClientInsertAllFields, 'id' | 'created_at' | 'updated_at'>;

type QuoteInsertAllFields = Database['public']['Tables']['quote']['Insert'];
export type QuoteInsert = Omit<QuoteInsertAllFields, 'id' | 'created_at' | 'updated_at'>;

type QuoteProductInsertAllFields = Database['public']['Tables']['quote_product']['Insert'];
export type QuoteProductInsert = Omit<QuoteProductInsertAllFields, 'quote_id' | 'created_at'>;
export type QuoteProductWithQuoteId = Omit<QuoteProductInsertAllFields, 'created_at'>;

type InvoiceInsertAllFields = Database['public']['Tables']['invoice']['Insert'];
export type InvoiceInsert = Omit<InvoiceInsertAllFields, 'id' | 'created_at' | 'updated_at'>;

type InvoiceProductInsertAllFields = Database['public']['Tables']['invoice_product']['Insert'];
export type InvoiceProductInsert = Omit<InvoiceProductInsertAllFields, 'invoice_id' | 'created_at'>;
export type InvoiceProductWithInvoiceId = Omit<InvoiceProductInsertAllFields, 'created_at'>;

// Quote status enum type and options
export type QuoteStatus = Database['public']['Enums']['quote_status_enum'];
type QuoteStatusOption = { value: QuoteStatus; label: string };
export const QUOTE_STATUS_OPTIONS: QuoteStatusOption[] = [
  { value: 'new', label: 'New' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

// Invoice status enum type and options
export type InvoiceStatus = Database['public']['Enums']['invoice_status_enum'];
type InvoiceStatusOption = { value: InvoiceStatus; label: string };
export const INVOICE_STATUS_OPTIONS: InvoiceStatusOption[] = [
  { value: 'new', label: 'New' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'query', label: 'Query' },
  { value: 'paid', label: 'Paid' },
];