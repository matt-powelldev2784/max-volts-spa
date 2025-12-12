import { describe, expect, test } from 'vitest';
import { convertPostgresProductsToSupabaseProducts } from '../2_migrateProducts.ts';

describe('convertPostgresProductsToSupabaseProducts', () => {
  test('maps legacy products to Supabase payload', () => {
    const createdAt = new Date('2024-01-01T10:30:00Z');
    const result = convertPostgresProductsToSupabaseProducts([
      {
        id: 1,
        name: 'Name',
        description: 'Test description',
        buy_price: 100,
        sell_price: 150,
        vat: 20,
        is_hidden: false,
        created_at: createdAt,
      },
    ]);

    expect(result).toEqual([
      {
        legacy_id: 1,
        name: 'Name',
        description: 'Test description',
        value: 100,
        markup: 50,
        vat: 20,
        is_visible_to_user: true,
        created_at: createdAt.toISOString(),
      },
    ]);
  });
});
