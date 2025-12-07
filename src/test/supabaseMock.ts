import type { Database } from '@/types/database.types';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;
type TableDataMap = { [K in TableName]: Tables[K]['Row'][] };
type SupabaseMockOverrides = Partial<TableDataMap>;

export const defaultRecords: TableDataMap = {
  client: [
    {
      id: 1,
      name: 'Test Client',
      company: 'Test Company',
      is_visible_to_user: true,
      address1: null,
      address2: null,
      city: null,
      county: null,
      created_at: null,
      email: null,
      post_code: null,
      telephone: null,
    },
    {
      id: 2,
      name: 'Another Client',
      company: 'Another Company',
      is_visible_to_user: true,
      address1: null,
      address2: null,
      city: null,
      county: null,
      created_at: null,
      email: null,
      post_code: null,
      telephone: null,
    },
  ],
  product: [
    {
      id: 1,
      name: 'Test Product',
      value: 100,
      markup: 100,
      vat: 20,
      is_visible_to_user: true,
      created_at: null,
      description: null,
    },
    {
      id: 2,
      name: 'Second Product',
      value: 200,
      markup: 15,
      vat: 20,
      is_visible_to_user: true,
      created_at: null,
      description: null,
    },
  ],
  quote: [
    {
      id: 1,
      client_id: 1,
      status: 'new',
      total_value: 120,
      total_vat: 24,
      user_id: 'user1',
      user_email: 'user1@test.com',
      created_at: null,
      date: null,
      notes: null,
      invoice_id: null,
    },
    {
      id: 2,
      client_id: 2,
      status: 'quoted',
      total_value: 220,
      total_vat: 44,
      user_id: 'user2',
      user_email: 'user2@test.com',
      created_at: null,
      date: null,
      notes: null,
      invoice_id: null,
    },
  ],
  quote_product: [
    {
      id: 1,
      quote_id: 1,
      product_id: 1,
      name: 'Test Product',
      value: 100,
      markup: 10,
      vat_rate: 20,
      total_value: 124,
      total_vat: 24,
      quantity: 1,
      description: 'Description for test product',
      created_at: null,
    },
    {
      id: 2,
      quote_id: 2,
      product_id: 2,
      name: 'Second Product',
      value: 200,
      markup: 15,
      vat_rate: 20,
      total_value: 552,
      total_vat: 92,
      quantity: 2,
      description: null,
      created_at: null,
    },
  ],
  invoice: [
    {
      id: 1,
      client_id: 1,
      status: 'new',
      total_value: 120,
      total_vat: 24,
      user_id: 'user1',
      user_email: 'user1@test.com',
      created_at: null,
      date: null,
      notes: null,
      quote_id: 1,
    },
    {
      id: 2,
      client_id: 2,
      status: 'paid',
      total_value: 220,
      total_vat: 44,
      user_id: 'user2',
      user_email: 'user2@test.com',
      created_at: null,
      date: null,
      notes: null,
      quote_id: 2,
    },
  ],
  invoice_product: [
    {
      id: 1,
      invoice_id: 1,
      product_id: 1,
      name: 'Test Product',
      value: 100,
      markup: 10,
      vat_rate: 20,
      total_value: 124,
      total_vat: 24,
      quantity: 1,
      description: 'Description for invoice product 1',
      created_at: null,
    },
    {
      id: 2,
      invoice_id: 2,
      product_id: 2,
      name: 'Second Product',
      value: 200,
      markup: 15,
      vat_rate: 20,
      total_value: 552,
      total_vat: 92,
      quantity: 2,
      description: 'Description for invoice product 2',
      created_at: null,
    },
  ],
};

export const createSupabaseMock = (overrides?: SupabaseMockOverrides) => {
  const records: TableDataMap = {
    ...defaultRecords,
    ...(overrides ?? {}),
  };

  const buildSelect = (table: TableName) => {
    const data = records[table];
    return {
      eq: () => ({
        order: () => ({ data, error: null }),
        single: () => ({ data: data[0] ?? null, error: null }),
        data,
        error: null,
      }),
      order: () => ({ data, error: null }),
      single: () => ({ data: data[0] ?? null, error: null }),
      data,
      error: null,
    };
  };

  return {
    supabase: {
      from: (table: TableName) => ({
        select: () => buildSelect(table),
      }),
    },
  };
};
