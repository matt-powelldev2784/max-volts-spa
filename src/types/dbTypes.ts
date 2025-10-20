import type { Database } from './database.types';

export type QuoteInsert = Database['public']['Tables']['quote']['Insert'];
export type QuoteProductInsert = Database['public']['Tables']['quote_product']['Insert'];
export type Client = Database['public']['Tables']['client']['Row'];
export type Quote = Database['public']['Tables']['quote']['Row'];
export type Product = Database['public']['Tables']['product']['Row'];
