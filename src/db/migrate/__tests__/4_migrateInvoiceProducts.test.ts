import { describe, expect, test } from 'vitest';
import { covertPostgresInvoiceProductsToSupabaseInvoiceProducts } from '../4_migrateInvoiceProducts.ts';

describe('covertPostgresInvoiceProductsToSupabaseInvoiceProducts', () => {
  test('maps legacy invoice products to Supabase payload', () => {
    const legacyInvoiceProducts = [
      {
        id: 'clvwoqlbe0000lc082op4h3id',
        invoice_id_legacy: 'clvwoqlbe0000lc082op4h3hi',
        product_id_legacy: 'clvwoqlbe0000lc082op4h3prop',
        quantity: 2,
        name: 'Test Product',
        description: 'Test Desc',
        vat_rate: 20,
        buy_price: 100,
        sell_price: 150,
        total_price: 300,
      },
      {
        id: 'clvwoqlbe0000lc082op4h2id',
        invoice_id_legacy: 'clvwoqlbe0000lc082op4h32i',
        product_id_legacy: 'clvwoqlbe0000lc082op4h3pr2p',
        quantity: 2,
        name: 'Test Product',
        description: 'Test Desc',
        vat_rate: 20,
        buy_price: 100,
        sell_price: 150,
        total_price: 300,
      },
    ];

    const invoiceMap = new Map([
      ['clvwoqlbe0000lc082op4h3hi', 1],
      ['clvwoqlbe0000lc082op4h32i', 1],
    ]);
    const productMap = new Map([
      ['clvwoqlbe0000lc082op4h3prop', 2],
      ['clvwoqlbe0000lc082op4h3pr2p', 2],
    ]);

    const result = covertPostgresInvoiceProductsToSupabaseInvoiceProducts({
      invoiceProducts: legacyInvoiceProducts,
      invoiceMap,
      productMap,
    });

    expect(result).toEqual([
      {
        legacy_id: 'clvwoqlbe0000lc082op4h3id',
        legacy_invoice_id: 'clvwoqlbe0000lc082op4h3hi',
        legacy_product_id: 'clvwoqlbe0000lc082op4h3prop',
        invoice_id: 1,
        product_id: 2,
        quantity: 2,
        name: 'Test Product',
        description: 'Test Desc',
        value: 150,
        markup: 0,
        vat_rate: 20,
        total_value: 360, // 2 x value * 1 + VAT /100
        total_vat: 60, // 2 x value * VAT /100
      },
      {
        legacy_id: 'clvwoqlbe0000lc082op4h2id',
        legacy_invoice_id: 'clvwoqlbe0000lc082op4h32i',
        legacy_product_id: 'clvwoqlbe0000lc082op4h3pr2p',
        invoice_id: 1,
        product_id: 2,
        quantity: 2,
        name: 'Test Product',
        description: 'Test Desc',
        value: 150,
        markup: 0,
        vat_rate: 20,
        total_value: 360, // 2 x value * 1 + VAT /100
        total_vat: 60, // 2 x value * VAT /100
      },
    ]);
  });
});
