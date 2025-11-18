'use strict';

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import type { ClientInsert, ProductInsert, QuoteInsert, QuoteProductWithQuoteId } from '../types/dbTypes';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const demoUserId = process.env.VITE_DEMO_USER_ID!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const dummyClient: ClientInsert = {
  name: 'Dummy Client',
  company: 'Dummy Company',
  email: 'dummy@example.com',
  telephone: '1234567890',
  address1: '123 Dummy Street',
  address2: 'Dummy Address Line 2',
  city: 'Dummy City',
  county: 'Dummy County',
  post_code: 'DU1 1MM',
  is_visible_to_user: true,
};

const dummyProduct: ProductInsert = {
  name: 'Dummy Product',
  value: 100,
  vat: 20,
  markup: 10,
  description: 'A dummy product for testing',
  is_visible_to_user: true,
};

const dummyQuote = {
  total_value: 880,
  total_vat: 80,
  user_email: 'dummy@example.com',
  user_id: demoUserId,
  notes: 'Dummy quote for testing',
};

const dummyQuoteProduct = {
  quantity: 2,
  total_value: 200,
  total_vat: 40,
  description: 'Dummy quote product',
};

const seedDatabase = async () => {
  // add client
  const { data: clientData, error: clientError } = await supabase.from('client').insert(dummyClient).select().single();

  if (clientError) {
    console.error('Error inserting client:', clientError.message);
    return;
  }

  // add product
  const { data: productData, error: productError } = await supabase
    .from('product')
    .insert(dummyProduct)
    .select()
    .single();

  if (productError) {
    console.error('Error inserting product:', productError.message);
    return;
  }

  // add quote
  const quoteToInsert: QuoteInsert = { ...dummyQuote, status: 'new', client_id: clientData.id };
  const { data: quoteData, error: quoteError } = await supabase.from('quote').insert(quoteToInsert).select().single();

  if (quoteError) {
    console.error('Error inserting quote:', quoteError.message);
    return;
  }

  if (!quoteData.id) {
    console.error('Quote data is undefined after insertion.');
    return;
  }

  // add quote product
  const quoteProductToInsert: QuoteProductWithQuoteId = {
    ...dummyQuoteProduct,
    quote_id: quoteData.id,
    product_id: productData.id,
    name: productData.name,
    value: productData.value,
    vat_rate: productData.vat,
    markup: productData.markup,
  };
  const { error: quoteProductError } = await supabase
    .from('quote_product')
    .insert(quoteProductToInsert)
    .select()
    .single();

  if (quoteProductError) {
    console.error('Error inserting quote_product:', quoteProductError.message);
    return;
  }
};

seedDatabase().catch(console.error);
