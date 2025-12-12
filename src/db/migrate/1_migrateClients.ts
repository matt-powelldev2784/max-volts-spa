import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { getEnvironmentVariables } from './getEnvironmentVariables.ts';

// run with: node -r dotenv/config src/db//migrate/1_migrateClients.ts

type LegacyClient = {
  id: number;
  name: string;
  company_name: string | null;
  email: string | null;
  address1: string | null;
  address2: string | null;
  postcode: string | null;
  tel: string | null;
  is_hidden: boolean;
  created_at: Date;
};

export const convertPostgrestClientsToSupabaseClients = (clients: LegacyClient[]) => {
  const supabaseClients = clients.map((client) => ({
    legacy_id: client.id,
    name: client.name,
    company: client.company_name ?? null,
    email: client.email ?? null,
    address1: client.address1 ?? null,
    address2: client.address2 ?? null,
    city: null,
    county: null,
    post_code: client.postcode ?? null,
    telephone: client.tel ?? null,
    created_at: client.created_at.toISOString(),
    is_visible_to_user: !client.is_hidden,
  }));

  return supabaseClients;
};

const migrateClients = async () => {
  const { RAILWAY_DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnvironmentVariables();

  const sourceDb = new PgClient({
    connectionString: RAILWAY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  await sourceDb.connect();

  try {
    const { rows: legacyClients } = await sourceDb.query<LegacyClient>(`
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

    const supabaseClients = convertPostgrestClientsToSupabaseClients(legacyClients);

    if (supabaseClients.length === 0) {
      throw new Error('No clients found to migrate.');
    }

    const { error } = await supabase.from('client').insert(supabaseClients);
    if (error) throw error;

    console.log(`Migrated ${supabaseClients.length} clients.`);
  } finally {
    await sourceDb.end();
  }
};

const runMigration = async () => {
  try {
    await migrateClients();
  } catch (err) {
    console.error('Client migration failed:', err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  runMigration();
}
