import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';

// run with: node -r dotenv/config src/db/migrate/3_migrateInvoices.ts

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

const statusFromLegacy = (): 'paid' | 'invoiced' | 'query' | 'new' => {
  return 'invoiced';
};

const migrateInvoices = async () => {
  await sourceDb.connect();

  try {
    const [{ rows: legacyInvoices }, { data: clients, error: clientsError }] = await Promise.all([
      sourceDb.query(`
          select
            id,
            "invoiceNum"  as invoice_number,
            "quoteNum"    as quote_number,
            "invoiceDate" as invoice_date,
            "clientId"    as client_id_legacy,
            "totalAmount" as total_amount,
            "paid"        as paid,
            "isActive"    as is_active
          from "Invoice"
        `),
      supabase.from('client').select('id, legacy_id'),
      supabase.from('quote').select('id, legacy_id'),
    ]);

    if (clientsError) throw clientsError;

    const clientMap = new Map((clients ?? []).map((row) => [row.legacy_id, row.id]));

    const payload = legacyInvoices.flatMap((row) => {
      const clientId = clientMap.get(row.client_id_legacy);

      if (!clientId) {
        console.warn(`Skipping invoice ${row.id} – missing client mapping for ${row.client_id_legacy}`);
        return [];
      }

      const timestamp = row.invoice_date ? new Date(row.invoice_date).toISOString() : null;

      return [
        {
          legacy_id: row.id,
          client_id: clientId,
          quote_id: 0,
          status: statusFromLegacy(),
          total_value: Number(row.total_amount ?? 0),
          total_vat: 0,
          notes: null,
          created_at: timestamp,
          date: timestamp,
          user_id: 'ed59a09b-69de-4b4a-90d3-92e246875960',
          user_email: 'legacyimport@email.com',
        },
      ];
    });

    if (payload.length === 0) {
      console.log('No invoices ready for migration.');
      return;
    }

    const payloadSortedByDate = payload.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    });

    const { error } = await supabase.from('invoice').insert(payloadSortedByDate);
    if (error) throw error;

    console.log(`Migrated ${payload.length} invoices.`);
  } finally {
    await sourceDb.end();
  }
};

migrateInvoices().catch((err) => {
  console.error('Invoice migration failed:', err);
  process.exit(1);
});
