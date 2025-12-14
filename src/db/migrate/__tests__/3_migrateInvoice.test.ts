import { describe, expect, test } from 'vitest';
import { convertPostgresInvoiceToSupabaseInvoice } from '../3_migrateInvoices.ts';

describe('convertPostgresInvoiceToSupabaseInvoice', () => {
  test('maps legacy invoices to Supabase payload', () => {
    const createdAt = new Date('2024-06-09T09:32:43.451Z');
    const legacyInvoices = [
      {
        id: 'clvwoqlbe0000lc082op4h3h1',
        invoice_number: 1,
        quote_number: 0,
        invoice_date: createdAt,
        client_id_legacy: 'clvwoqlbe0000lc082op4h3h2',
        total_amount: 123.45,
        paid: false,
        is_active: true,
      },
    ];
    const clientMap = new Map([['clvwoqlbe0000lc082op4h3h2', 1]]);

    const result = convertPostgresInvoiceToSupabaseInvoice({
      invoices: legacyInvoices,
      clientMap,
    });

    expect(result).toEqual([
      {
        legacy_id: 'clvwoqlbe0000lc082op4h3h1',
        client_id: 1,
        quote_id: 0,
        status: 'legacy',
        total_value: 123.45,
        total_vat: 0,
        notes: '',
        created_at: createdAt.toISOString(),
        date: createdAt.toISOString(),
        user_id: 'ed59a09b-69de-4b4a-90d3-92e246875960',
        user_email: 'legacyimport@email.com',
        updated_at: expect.any(String),
      },
    ]);
  });
});
