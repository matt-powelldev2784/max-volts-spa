import { describe, expect, test } from 'vitest';
import { convertPostgresQuoteProductsToSupabaseQuoteProducts } from '../6_migrateQuoteProducts.ts';

describe('convertPostgresQuoteProductsToSupabaseQuoteProducts', () => {
  test('maps legacy quote products to Supabase payload', () => {
    const legacyQuoteProducts = [
      {
        id: 'clvwoqlbe0000lc082op4h3qid',
        quote_id_legacy: 'clvwoqlbe0000lc082op4h3aq',
        product_id_legacy: 'clvwoqlbe0000lc082op4h3ap',
        quantity: 2,
        name: 'Test Quote Product',
        description: 'Quote Desc',
        vat_rate: 20,
        buy_price: 100,
        sell_price: 150,
        total_price: 300,
      },
    ];

    const quoteMap = new Map([['clvwoqlbe0000lc082op4h3aq', 1]]);
    const productMap = new Map([['clvwoqlbe0000lc082op4h3ap', 2]]);

    const result = convertPostgresQuoteProductsToSupabaseQuoteProducts({
      quoteProducts: legacyQuoteProducts,
      quoteMap,
      productMap,
    });

    expect(result).toEqual([
      {
        legacy_id: 'clvwoqlbe0000lc082op4h3qid',
        legacy_quote_id: 'clvwoqlbe0000lc082op4h3aq',
        legacy_product_id: 'clvwoqlbe0000lc082op4h3ap',
        quote_id: 1,
        product_id: 2,
        quantity: 2,
        name: 'Test Quote Product',
        description: 'Quote Desc',
        value: 150,
        markup: 0,
        vat_rate: 20,
        total_value: 360,
        total_vat: 60,
      },
    ]);
  });
});
