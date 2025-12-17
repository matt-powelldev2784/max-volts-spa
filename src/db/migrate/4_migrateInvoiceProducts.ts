import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { getTotalProductValue, getTotalProductVat } from '../../lib/quoteCalculator.ts';
import { getEnvironmentVariables } from './getEnvironmentVariables.ts';

// run with: node -r dotenv/config src/db/migrate/4_migrateInvoiceProducts.ts

type LegacyInvoiceProduct = {
  id: string;
  invoice_id_legacy: string;
  product_id_legacy: string;
  quantity: number;
  name: string;
  description: string;
  vat_rate: number;
  buy_price: number;
  sell_price: number;
  total_price: number;
};

type ConvertInvoiceProductsProps = {
  invoiceProducts: LegacyInvoiceProduct[];
  invoiceMap: Map<string, number>;
  productMap: Map<string, number>;
};

export const covertPostgresInvoiceProductsToSupabaseInvoiceProducts = ({
  invoiceProducts,
  invoiceMap,
  productMap,
}: ConvertInvoiceProductsProps) => {
  const supabaseInvoiceProducts = invoiceProducts.map((invoiceProduct) => {
    const quantity = invoiceProduct.quantity;
    const value = invoiceProduct.sell_price;
    const markup = 0;
    const vatRate = invoiceProduct.vat_rate;
    const totalValue = getTotalProductValue({ quantity, value, vat_rate: vatRate, markup });
    const totalVat = getTotalProductVat({ quantity, value, vat_rate: vatRate, markup });

    const invoiceId = invoiceMap.get(invoiceProduct.invoice_id_legacy);
    const productId = productMap.get(invoiceProduct.product_id_legacy);

    if (!invoiceId) {
      throw new Error(
        `Invoice product ${invoiceProduct.id} missing invoice mapping : ${invoiceProduct.invoice_id_legacy})`
      );
    }

    if (!productId) {
      throw new Error(
        `Invoice product ${invoiceProduct.id} missing product mapping ${invoiceProduct.product_id_legacy})`
      );
    }

    return {
      legacy_id: invoiceProduct.id,
      legacy_invoice_id: invoiceProduct.invoice_id_legacy,
      legacy_product_id: invoiceProduct.product_id_legacy,
      invoice_id: invoiceId,
      product_id: productId,
      quantity,
      name: invoiceProduct.name,
      description: invoiceProduct.description ?? null,
      value,
      markup,
      vat_rate: vatRate,
      total_value: totalValue,
      total_vat: totalVat,
    };
  });

  return supabaseInvoiceProducts;
};

const migrateInvoiceProducts = async () => {
  const { RAILWAY_DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnvironmentVariables();

  const sourceDb = new PgClient({
    connectionString: RAILWAY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await sourceDb.connect();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { rows: legacyInvoiceRows } = await sourceDb.query(`
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
        `);

    const { data: invoices, error: invoicesError } = await supabase.from('invoice').select('id, legacy_id');
    const { data: products, error: productsError } = await supabase.from('product').select('id, legacy_id');

    if (invoicesError) throw invoicesError;
    if (invoices.length === 0) {
      throw new Error('No invoices found in Supabase, invoice migration not possible without invoice mapping.');
    }
    if (productsError) throw productsError;
    if (products.length === 0) {
      throw new Error('No products found in Supabase, invoice migration not possible without products mapping.');
    }

    const invoiceMap = new Map(invoices.map((row) => [row.legacy_id, row.id]));
    const productMap = new Map(products.map((row) => [row.legacy_id, row.id]));

    const updatedInvoiceProducts = covertPostgresInvoiceProductsToSupabaseInvoiceProducts({
      invoiceProducts: legacyInvoiceRows,
      invoiceMap,
      productMap,
    });

    if (updatedInvoiceProducts.length === 0) {
      console.log('No invoice rows ready for migration.');
      return;
    }

    const { error } = await supabase.from('invoice_product').insert(updatedInvoiceProducts);
    if (error) throw error;

    console.log(`Migrated ${updatedInvoiceProducts.length} invoice products.`);
  } finally {
    await sourceDb.end();
  }
};

const runMigration = async () => {
  try {
    await migrateInvoiceProducts();
  } catch (err) {
    console.error('Invoice product migration failed:', err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  runMigration();
}
