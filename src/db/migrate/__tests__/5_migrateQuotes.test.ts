import { describe, expect, test } from 'vitest';
import { convertPostgresQuotesToSupabaseQuotes } from '../5_migrateQuotes.ts';

describe('convertPostgresQuotesToSupabaseQuotes', () => {
  test('maps legacy quotes to Supabase payload', () => {
    const createdAt = new Date('2024-06-09T09:32:43.451Z');
    const legacyQuotes = [
      {
        id: 'clvwoqlbe0000lc082op4h3id',
        quote_number: 1,
        quote_date: createdAt,
        client_id_legacy: 'clvwoqlbe0000lc082op4h3ac',
        total_amount: 500,
      },
    ];

    const clientMap = new Map([['clvwoqlbe0000lc082op4h3ac', 1]]);

    const result = convertPostgresQuotesToSupabaseQuotes({
      quotes: legacyQuotes,
      clientMap,
    });

    expect(result).toEqual([
      {
        legacy_id: 'clvwoqlbe0000lc082op4h3id',
        client_id: 1,
        invoice_id: null,
        status: 'legacy',
        total_value: 500,
        total_vat: 0,
        notes: '',
        created_at: createdAt.toISOString(),
        date: createdAt.toISOString(),
        user_id: 'ed59a09b-69de-4b4a-90d3-92e246875960',
        user_email: 'legacyimport@email.com',
      },
    ]);
  });
});
