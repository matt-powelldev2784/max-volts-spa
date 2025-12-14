import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { getEnvironmentVariables } from './getEnvironmentVariables.ts';

// run with: node -r dotenv/config src/db/migrate/5_migrateQuotes.ts

type LegacyQuote = {
  id: string;
  quote_number: number;
  quote_date: Date;
  client_id_legacy: string;
  total_amount: number;
};

type ConvertQuoteProps = {
  quotes: LegacyQuote[];
  clientMap: Map<string, number>;
};

export const convertPostgresQuotesToSupabaseQuotes = ({ quotes, clientMap }: ConvertQuoteProps) => {
  const supabaseQuotes = quotes.map((quote) => {
    const clientId = clientMap.get(quote.client_id_legacy);

    if (!clientId) {
      throw new Error(`Error processing quote ${quote.id}, missing client mapping for ${quote.client_id_legacy}`);
    }

    const timestamp = new Date(quote.quote_date).toISOString();

    return {
      date: timestamp,
      client_id: clientId,
      user_id: 'ed59a09b-69de-4b4a-90d3-92e246875960',
      status: 'legacy',
      notes: '',
      total_value: Number(quote.total_amount),
      created_at: timestamp,
      user_email: 'legacyimport@email.com',
      total_vat: 0,
      invoice_id: null,
      legacy_id: quote.id,
      updated_at: new Date().toISOString(),
    };
  });

  return supabaseQuotes;
};

const migrateQuotes = async () => {
  const { RAILWAY_DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnvironmentVariables();

  const sourceDb = new PgClient({
    connectionString: RAILWAY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await sourceDb.connect();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { rows: legacyQuotes } = await sourceDb.query(`
        select
          id,
          "quoteNum"    as quote_number,
          "quoteDate"   as quote_date,
          "clientId"    as client_id_legacy,
          "totalAmount" as total_amount,
          "isActive"    as is_active
        from "Quote"
      `);

    const { data: clients, error: clientsError } = await supabase.from('client').select('id, legacy_id');
    if (clientsError) throw clientsError;
    if (clients.length === 0) {
      throw new Error('No clients found in Supabase, quote migration not possible without client mapping.');
    }

    const { data: invoices, error: invoicesError } = await supabase.from('invoice').select('id, legacy_id');
    if (invoicesError) throw invoicesError;
    if (invoices.length === 0) {
      console.warn('No invoices found in Supabase, quote migration not possible without invoice mapping.');
    }

    const clientMap = new Map(clients.map((client) => [client.legacy_id, client.id]));

    const updatedQuotes = convertPostgresQuotesToSupabaseQuotes({
      quotes: legacyQuotes,
      clientMap,
    });

    if (updatedQuotes.length === 0) {
      console.log('No quotes ready for migration.');
      return;
    }

    const quotesSortedByDate = updatedQuotes.sort((a, b) => {
      if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    });

    const { error } = await supabase.from('quote').insert(quotesSortedByDate).select('id');
    if (error) throw error;

    console.log(`Migrated ${quotesSortedByDate.length} quotes.`);
  } finally {
    await sourceDb.end();
  }
};

const runMigration = async () => {
  try {
    await migrateQuotes();
  } catch (err) {
    console.error('Invoice migration failed:', err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  runMigration();
}

