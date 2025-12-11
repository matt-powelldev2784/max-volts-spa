import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { getTotalProductValue, getTotalProductVat } from '../../lib/quoteCalculator.ts';

// run with: node -r dotenv/config src/db/migrate/6_migrateQuoteProducts.ts

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

const migrateQuoteProducts = async () => {
  await sourceDb.connect();

  try {
    const [{ rows: legacyRows }, { data: quotes, error: quotesError }, { data: products, error: productsError }] =
      await Promise.all([
        sourceDb.query(`
          select
            id,
            "quoteId"   as quote_id_legacy,
            "productId" as product_id_legacy,
            quantity,
            name,
            description,
            "VAT"       as vat_rate,
            "buyPrice"  as buy_price,
            "sellPrice" as sell_price,
            "totalPrice" as total_price
          from "QuoteRow"
        `),
        supabase.from('quote').select('id, legacy_id'),
        supabase.from('product').select('id, legacy_id'),
      ]);

    if (quotesError) throw quotesError;
    if (productsError) throw productsError;

    const quoteMap = new Map((quotes ?? []).map((row) => [row.legacy_id, row.id]));
    const productMap = new Map((products ?? []).map((row) => [row.legacy_id, row.id]));

    let missingMappings = 0;

    const payload = legacyRows.map((row) => {
      const quantity = row.quantity ?? 1;
      const value = row.buy_price ?? 0;
      const sellPrice = row.sell_price ?? value;
      const markup = value > 0 ? Number((((sellPrice - value) / value) * 100).toFixed(2)) : 0;
      const vatRate = row.vat_rate ?? 0;
      const totalValue = getTotalProductValue({ quantity, value, vat_rate: vatRate, markup });
      const totalVat = getTotalProductVat({ quantity, value, vat_rate: vatRate, markup });

      const quoteId = quoteMap.get(row.quote_id_legacy) ?? null;
      const productId = productMap.get(row.product_id_legacy) ?? null;

      if (!quoteId || !productId) {
        missingMappings += 1;
        console.warn(
          `QuoteRow ${row.id} missing mapping (quote: ${row.quote_id_legacy}, product: ${row.product_id_legacy})`
        );
      }

      return {
        legacy_id: row.id,
        legacy_quote_id: row.quote_id_legacy,
        legacy_product_id: row.product_id_legacy,
        quote_id: quoteId,
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

    if (missingMappings > 0) {
      throw new Error(`Aborting: ${missingMappings} quote rows are missing quote/product mappings.`);
    }

    if (payload.length === 0) {
      console.log('No quote rows ready for migration.');
      return;
    }

    const { data, error } = await supabase.from('quote_product').insert(payload).select('id');
    if (error) throw error;

    if ((data?.length ?? 0) !== payload.length) {
      throw new Error(`Inserted ${data?.length ?? 0} quote rows, expected ${payload.length}. Migration cancelled.`);
    }

    console.log(`Migrated ${payload.length} quote products.`);
  } finally {
    await sourceDb.end();
  }
};

migrateQuoteProducts().catch((err) => {
  console.error('Quote product migration failed:', err);
  process.exit(1);
});
