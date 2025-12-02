import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const deleteTestRecords = async () => {
  // invoice_product: name contains __Test
  const { error: invoiceProductError } = await supabase.from('invoice_product').delete().like('name', '%__Test%');
  if (invoiceProductError) {
    console.error('Error deleting from invoice_product:', invoiceProductError.message);
  }

  // invoice: notes contains __Test
  const { error: invoiceError } = await supabase.from('invoice').delete().like('notes', '%__Test%');
  if (invoiceError) {
    console.error('Error deleting from invoice:', invoiceError.message);
  }

  // quote_product: name contains __Test
  const { error: quoteProductError } = await supabase.from('quote_product').delete().like('name', '%__Test%');
  if (quoteProductError) {
    console.error('Error deleting from quote_product:', quoteProductError.message);
  }

  // quote: notes contains __Test
  const { error: quoteError } = await supabase.from('quote').delete().like('notes', '%__Test%');
  if (quoteError) {
    console.error('Error deleting from quote:', quoteError.message);
  }

  // product: name contains __Test
  const { error: productsError } = await supabase.from('product').delete().like('name', '%__Test%');
  if (productsError) {
    console.error('Error deleting from product:', productsError.message);
  }

  // client: name contains __Test
  const { error: clientError } = await supabase.from('client').delete().like('name', '%__Test%');
  if (clientError) {
    console.error('Error deleting from client:', clientError.message);
  }
};

deleteTestRecords().catch(console.error);
