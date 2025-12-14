import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { getEnvironmentVariables } from './getEnvironmentVariables.ts';

// run with: node -r dotenv/config src/db/migrate/3_migrateInvoices.ts

type LegacyInvoice = {
  id: string;
  invoice_number: number;
  quote_number: number;
  invoice_date: Date;
  client_id_legacy: string;
  total_amount: number;
  paid: boolean;
  is_active: boolean;
};

type ConvertInvoiceProps = {
  invoices: LegacyInvoice[];
  clientMap: Map<string, number>;
};

export const convertPostgresInvoiceToSupabaseInvoice = ({ invoices, clientMap }: ConvertInvoiceProps) => {
  const supabaseProducts = invoices.map((invoice) => {
    const timestamp = new Date(invoice.invoice_date).toISOString();
    const clientId = clientMap.get(invoice.client_id_legacy);

    if (!clientId) {
      throw new Error(`Error processing invoice ${invoice.id}, missing client mapping for ${invoice.client_id_legacy}`);
    }

    return {
      legacy_id: invoice.id,
      client_id: clientId,
      quote_id: 0,
      status: 'legacy',
      total_value: Number(invoice.total_amount),
      total_vat: 0,
      notes: '',
      created_at: timestamp,
      date: timestamp,
      user_id: 'ed59a09b-69de-4b4a-90d3-92e246875960',
      user_email: 'legacyimport@email.com',
    };
  });

  return supabaseProducts;
};

const migrateInvoices = async () => {
  const { RAILWAY_DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnvironmentVariables();

  const sourceDb = new PgClient({
    connectionString: RAILWAY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await sourceDb.connect();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { rows: legacyInvoices } = await sourceDb.query(`
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
        `);

    const { data: clients, error: clientsError } = await supabase.from('client').select('id, legacy_id');
    if (clientsError) throw clientsError;
    if (clients.length === 0) {
      throw new Error('No clients found in Supabase, invoice migration not possible without client mapping.');
    }

    const clientMap = new Map(clients.map((client) => [client.legacy_id, client.id]));

    const invoices = convertPostgresInvoiceToSupabaseInvoice({
      invoices: legacyInvoices,
      clientMap,
    });

    if (invoices.length === 0) {
      console.log('No invoices available for migration.');
      return;
    }

    const invoicesSortedByDate = invoices.sort((a, b) => {
      const timestampA = new Date(a.date).getTime();
      const tomeStampB = new Date(b.date).getTime();
      return timestampA - tomeStampB;
    });

    const { error } = await supabase.from('invoice').insert(invoicesSortedByDate);
    if (error) throw error;

    console.log(`Migrated ${invoicesSortedByDate.length} invoices.`);
  } finally {
    await sourceDb.end();
  }
};

const runMigration = async () => {
  try {
    await migrateInvoices();
  } catch (err) {
    console.error('Invoice migration failed:', err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  runMigration();
}
