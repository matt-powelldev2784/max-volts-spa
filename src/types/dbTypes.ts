import type { Database } from './database.types';

export type Client = Database['public']['Tables']['client']['Row'];
export type Quote = Database['public']['Tables']['quote']['Row'];
export type Product = Database['public']['Tables']['product']['Row'];
export type QuoteProduct = Database['public']['Tables']['quote_product']['Row'];

type QuoteProductInsertAllFields = Database['public']['Tables']['quote_product']['Insert'];
export type QuoteProductInsert = Omit<QuoteProductInsertAllFields, 'quote_id'>;
export type QuoteProductUpdate = Omit<QuoteProductInsertAllFields, 'quote_id' | 'created_at'>;

type QuoteInsertAllFields = Database['public']['Tables']['quote']['Insert'];
export type QuoteInsert = Omit<QuoteInsertAllFields, 'id' | 'created_at' | 'updated_at'>;

type ProductInsertAllFields = Database['public']['Tables']['product']['Insert'];
export type ProductInsert = Omit<ProductInsertAllFields, 'id' | 'created_at' | 'updated_at'>;

type ClientInsertAllFields = Database['public']['Tables']['client']['Insert'];
export type ClientInsert = Omit<ClientInsertAllFields, 'id' | 'created_at' | 'updated_at'>;

export type QuoteStatus = 'new' | 'quoted' | 'accepted' | 'rejected';

type QuoteStatusOption = { value: QuoteStatus; label: string };

export const QUOTE_STATUS_OPTIONS: QuoteStatusOption[] = [
  { value: 'new', label: 'New' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];