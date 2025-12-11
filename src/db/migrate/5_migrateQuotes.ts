import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';

// run with: node -r dotenv/config src/db/migrate/5_migrateQuotes.ts

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

const statusFromLegacy = (): 'new' | 'quoted' | 'accepted' | 'rejected' | 'invoiced' => 'invoiced';

const migrateQuotes = async () => {
  await sourceDb.connect();

  try {
    const [{ rows: legacyQuotes }, { data: clients, error: clientsError }, { data: invoices, error: invoicesError }] =
      await Promise.all([
        sourceDb.query(`
        select
          id,
          "quoteNum"    as quote_number,
          "quoteDate"   as quote_date,
          "clientId"    as client_id_legacy,
          "totalAmount" as total_amount,
          "isActive"    as is_active
        from "Quote"
      `),
        supabase.from('client').select('id, legacy_id'),
        supabase.from('invoice').select('id, legacy_id'),
      ]);

    if (clientsError) throw clientsError;
    if (invoicesError) throw invoicesError;

    const clientMap = new Map((clients ?? []).map((row) => [row.legacy_id, row.id]));
    const invoiceMap = new Map((invoices ?? []).map((row) => [row.legacy_id, row.id]));

    let missingClients = 0;

    const payload = legacyQuotes
      .map((row) => {
        const clientId = clientMap.get(row.client_id_legacy);

        if (!clientId) {
          missingClients += 1;
          console.warn(`Quote ${row.id} skipped – missing client mapping (${row.client_id_legacy}).`);
          return null;
        }

        const timestamp = row.quote_date ? new Date(row.quote_date).toISOString() : null;

        return {
          legacy_id: row.id,
          client_id: clientId,
          invoice_id: invoiceMap.get(row.id) ?? null,
          status: statusFromLegacy(),
          total_value: Number(row.total_amount ?? 0),
          total_vat: 0,
          notes: null,
          created_at: timestamp,
          date: timestamp,
          user_id: 'ed59a09b-69de-4b4a-90d3-92e246875960',
          user_email: 'legacyimport@email.com',
        };
      })
      .filter((row) => row !== null);

    if (missingClients > 0) {
      throw new Error(`Aborting: ${missingClients} quotes lack client mappings.`);
    }

    if (payload.length === 0) {
      console.log('No quotes ready for migration.');
      return;
    }

    const sortedQuotes = payload.sort((a, b) => {
      if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    });

    const { data, error } = await supabase.from('quote').insert(sortedQuotes).select('id');
    if (error) throw error;

    if ((data?.length ?? 0) !== payload.length) {
      throw new Error(`Inserted ${data?.length ?? 0} quotes, expected ${payload.length}.`);
    }

    console.log(`Migrated ${payload.length} quotes.`);
  } finally {
    await sourceDb.end();
  }
};

migrateQuotes().catch((err) => {
  console.error('Quote migration failed:', err);
  process.exit(1);
});
