import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

type TableName = 'client' | 'product' | 'quote' | 'quote_product';

const clearTable = async (table: TableName) => {
  const { error } = await supabase.from(table).delete().neq('id', 0); // delete all rows
  if (error) {
    console.error(`Error deleting from ${table}:`, error.message);
  } else {
    console.log(`Cleared table: ${table}`);
  }
};

const clearTestDb = async () => {
  await clearTable('quote_product');
  await clearTable('quote');
  await clearTable('product');
  await clearTable('client');
  console.log('All tables cleared.');
};

clearTestDb().catch(console.error);
