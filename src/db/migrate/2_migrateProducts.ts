import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { getEnvironmentVariables } from './getEnvironmentVariables.ts';

// run with: node -r dotenv/config src/db/migrate/2_migrateProducts.ts

type LegacyProduct = {
  id: number;
  name: string;
  description: string;
  buy_price: number;
  sell_price: number;
  vat: number;
  is_hidden: boolean;
  created_at: Date;
};

export const convertPostgresProductsToSupabaseProducts = (products: LegacyProduct[]) => {
  const supabaseProducts = products.map((product) => {
    const value = product.buy_price;
    const sellPrice = product.sell_price;
    const markup = value > 0 ? Number((((sellPrice - value) / value) * 100).toFixed(2)) : 0;

    return {
      legacy_id: product.id,
      name: product.name,
      description: product.description ?? null,
      value,
      markup,
      vat: product.vat,
      created_at: product.created_at.toISOString(),
      is_visible_to_user: !product.is_hidden,
    };
  });

  return supabaseProducts;
};

const migrateProducts = async () => {
  const { RAILWAY_DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnvironmentVariables();

  const sourceDb = new PgClient({
    connectionString: RAILWAY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  await sourceDb.connect();

  try {
    const { rows: legacyProducts } = await sourceDb.query<LegacyProduct>(`
      select
        id,
        name,
        description,
        "buyPrice" as buy_price,
        "sellPrice" as sell_price,
        "VAT" as vat,
        "isHidden" as is_hidden,
        now() as created_at
      from "Product"
    `);

    const supabaseProducts = convertPostgresProductsToSupabaseProducts(legacyProducts);

    if (supabaseProducts.length === 0) {
      console.log('No products found to migrate.');
      return;
    }

    const { error } = await supabase.from('product').insert(supabaseProducts);
    if (error) throw error;

    console.log(`Migrated ${supabaseProducts.length} products.`);
  } finally {
    await sourceDb.end();
  }
};

const runMigration = async () => {
  try {
    await migrateProducts();
  } catch (err) {
    console.error('Product migration failed:', err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  runMigration();
}


