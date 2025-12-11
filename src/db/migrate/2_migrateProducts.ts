import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';

// run with: node -r dotenv/config src/db/migrate/2_migrateProducts.ts

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

const migrateProducts = async () => {
  await sourceDb.connect();

  try {
    const { rows } = await sourceDb.query(`
      select
        id,
        name,
        "buyPrice" as buy_price,
        description,
        "sellPrice" as sell_price,
        "VAT" as vat,
        "isHidden" as is_hidden,
        now() as created_at
      from "Product"
    `);

    const payload = rows.map((row) => {
      const value = row.buy_price ?? 0;
      const sellPrice = row.sell_price ?? value;
      const markup = value > 0 ? Number((((sellPrice - value) / value) * 100).toFixed(2)) : 0;

      return {
        legacy_id: row.id,
        name: row.name,
        description: row.description ?? null,
        value,
        markup,
        vat: row.vat ?? 20,
        created_at: row.created_at.toISOString(),
        is_visible_to_user: !row.is_hidden,
      };
    });

    if (payload.length === 0) {
      console.log('No products found to migrate.');
      return;
    }

    const { error } = await supabase.from('product').insert(payload);
    if (error) throw error;

    console.log(`Migrated ${payload.length} products.`);
  } finally {
    await sourceDb.end();
  }
};

migrateProducts().catch((err) => {
  console.error('Product migration failed:', err);
  process.exit(1);
});
