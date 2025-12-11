import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';

// run with: node -r dotenv/config src/db//migrate/1_migrateClients.ts

const RAILWAY_DATABASE_URL = process.env.RAILWAY_DATABASE_URL ?? process.env.VITE_RAILWAY_DATABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!RAILWAY_DATABASE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env vars: RAILWAY_DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

const sourceDb = new PgClient({
  connectionString: RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const migrateClients = async () => {
  await sourceDb.connect();

  try {
    const { rows } = await sourceDb.query(`
      select
        id,
        name,
        "companyName" as company_name,
        email,
        "add1" as address1,
        "add2" as address2,
        postcode,
        tel,
        "isHidden" as is_hidden,
        now() as created_at
      from "Client"
    `);

    const payload = rows.map((row) => ({
      legacy_id: row.id,
      name: row.name,
      company: row.company_name ?? null,
      email: row.email ?? null,
      address1: row.address1 ?? null,
      address2: row.address2 ?? null,
      city: null,
      county: null,
      post_code: row.postcode ?? null,
      telephone: row.tel ?? null,
      created_at: row.created_at.toISOString(),
      is_visible_to_user: !row.is_hidden,
    }));

    const { error } = await supabase.from('client').insert(payload);
    if (error) throw error;

    console.log(`Migrated ${payload.length} clients.`);
  } finally {
    await sourceDb.end();
  }
};

migrateClients().catch((err) => {
  console.error('Client migration failed:', err);
  process.exit(1);
});
