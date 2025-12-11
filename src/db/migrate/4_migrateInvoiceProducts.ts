import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { getTotalProductValue, getTotalProductVat } from '../../lib/quoteCalculator.ts';

// run with: node -r dotenv/config src/db/migrate/4_migrateInvoiceProducts.ts

const railwayUrl = process.env.RAILWAY_DATABASE_URL ?? process.env.VITE_RAILWAY_DATABASE_URL;
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!railwayUrl || !supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing env vars: RAILWAY_DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

const sourceDb = new PgClient({
  connectionString: railwayUrl,
  ssl: { rejectUnauthorized: false },
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrateInvoiceProducts = async () => {
  await sourceDb.connect();

  try {
    const [{ rows: legacyRows }, { data: invoices, error: invoicesError }, { data: products, error: productsError }] =
      await Promise.all([
        sourceDb.query(`
          select
            id,
            "invoiceId" as invoice_id_legacy,
            "productId" as product_id_legacy,
            quantity,
            name,
            description,
            "VAT" as vat_rate,
            "buyPrice" as buy_price,
            "sellPrice" as sell_price,
            "totalPrice" as total_price
          from "InvoiceRow"
        `),
        supabase.from('invoice').select('id, legacy_id'),
        supabase.from('product').select('id, legacy_id'),
      ]);

    if (invoicesError) throw invoicesError;
    if (productsError) throw productsError;

    const invoiceMap = new Map((invoices ?? []).map((row) => [row.legacy_id, row.id]));
    const productMap = new Map((products ?? []).map((row) => [row.legacy_id, row.id]));

    const payload = legacyRows.map((row) => {
      const quantity = row.quantity;
      const value = row.sell_price;
      const markup = 0;
      const vatRate = row.vat_rate ?? 0;
      const totalValue = getTotalProductValue({ quantity, value, vat_rate: vatRate, markup });
      const totalVat = getTotalProductVat({ quantity, value, vat_rate: vatRate, markup });

      const invoiceId = invoiceMap.get(row.invoice_id_legacy) ?? null;
      const productId = productMap.get(row.product_id_legacy) ?? null;

      if (!invoiceId || !productId) {
        console.warn(
          `InvoiceRow ${row.id} missing mapping (invoice: ${row.invoice_id_legacy}, product: ${row.product_id_legacy})`
        );
      }

      return {
        legacy_id: row.id,
        legacy_invoice_id: row.invoice_id_legacy,
        legacy_product_id: row.product_id_legacy,
        invoice_id: invoiceId,
        product_id: productId,
        quantity,
        name: row.name,
        description: row.description ?? null,
        value,
        markup,
        vat_rate: vatRate,
        total_value: totalValue,
        total_vat: totalVat,
      };
    });

    if (payload.length === 0) {
      console.log('No invoice rows ready for migration.');
      return;
    }

    const { error } = await supabase.from('invoice_product').insert(payload);
    if (error) throw error;

    console.log(`Migrated ${payload.length} invoice products.`);
  } finally {
    await sourceDb.end();
  }
};

migrateInvoiceProducts().catch((err) => {
  console.error('Invoice product migration failed:', err);
  process.exit(1);
});
