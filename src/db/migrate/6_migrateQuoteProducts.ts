import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { getTotalProductValue, getTotalProductVat } from '../../lib/quoteCalculator.ts';
import { getEnvironmentVariables } from './getEnvironmentVariables.ts';

// run with: node -r dotenv/config src/db/migrate/6_migrateQuoteProducts.ts

type LegacyQuoteProduct = {
  id: string;
  quote_id_legacy: string;
  product_id_legacy: string;
  quantity: number;
  name: string;
  description: string;
  vat_rate: number;
  buy_price: number;
  sell_price: number;
  total_price: number;
};

type ConvertQuoteProductsProps = {
  quoteProducts: LegacyQuoteProduct[];
  quoteMap: Map<string, number>;
  productMap: Map<string, number>;
};

export const convertPostgresQuoteProductsToSupabaseQuoteProducts = ({
  quoteProducts,
  quoteMap,
  productMap,
}: ConvertQuoteProductsProps) => {
  const supabaseQuoteProducts = quoteProducts.map((quoteProduct) => {
    const quantity = quoteProduct.quantity;
    const value = quoteProduct.sell_price;
    const markup = 0;
    const vatRate = quoteProduct.vat_rate;
    const totalValue = getTotalProductValue({ quantity, value, vat_rate: vatRate, markup });
    const totalVat = getTotalProductVat({ quantity, value, vat_rate: vatRate, markup });

    const quoteId = quoteMap.get(quoteProduct.quote_id_legacy);
    const productId = productMap.get(quoteProduct.product_id_legacy);

    if (!quoteId) {
      throw new Error(`Quote product ${quoteProduct.id} missing quote mapping : ${quoteProduct.quote_id_legacy})`);
    }

    if (!productId) {
      throw new Error(`Quote product ${quoteProduct.id} missing product mapping ${quoteProduct.product_id_legacy})`);
    }

    return {
      legacy_id: quoteProduct.id,
      legacy_quote_id: quoteProduct.quote_id_legacy,
      legacy_product_id: quoteProduct.product_id_legacy,
      quote_id: quoteId,
      product_id: productId,
      quantity,
      name: quoteProduct.name,
      description: quoteProduct.description ?? '',
      value,
      markup,
      vat_rate: vatRate,
      total_value: totalValue,
      total_vat: totalVat,
    };
  });

  return supabaseQuoteProducts;
};

const migrateQuoteProducts = async () => {
  const { RAILWAY_DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnvironmentVariables();

  const sourceDb = new PgClient({
    connectionString: RAILWAY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await sourceDb.connect();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { rows: legacyRows } = await sourceDb.query(`
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
        `);

    const { data: quotes, error: quotesError } = await supabase.from('quote').select('id, legacy_id');
    if (quotesError) throw quotesError;
    if (quotes.length === 0) {
      throw new Error('No quotes found in Supabase, quote product migration not possible without quote mapping.');
    }

    const { data: products, error: productsError } = await supabase.from('product').select('id, legacy_id');
    if (productsError) throw productsError;
    if (products.length === 0) {
      throw new Error('No products found in Supabase, quote product migration not possible without products mapping.');
    }

    const quoteMap = new Map(quotes.map((quote) => [quote.legacy_id, quote.id]));
    const productMap = new Map(products.map((product) => [product.legacy_id, product.id]));

    const updatedQuotes = convertPostgresQuoteProductsToSupabaseQuoteProducts({
      quoteProducts: legacyRows,
      quoteMap,
      productMap,
    });

    if (updatedQuotes.length === 0) {
      console.log('No quote rows ready for migration.');
      return;
    }

    const { error } = await supabase.from('quote_product').insert(updatedQuotes).select('id');
    if (error) throw error;

    console.log(`Migrated ${updatedQuotes.length} quote products.`);
  } finally {
    await sourceDb.end();
  }
};

const runMigration = async () => {
  try {
    await migrateQuoteProducts();
  } catch (err) {
    console.error('Quote product migration failed:', err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  runMigration();
}
