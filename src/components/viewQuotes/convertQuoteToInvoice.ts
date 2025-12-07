import { supabase } from '@/lib/supabase';
import type { InvoiceInsert, InvoiceProductWithInvoiceId } from '@/types/dbTypes';

export const convertQuoteToInvoice = async (quoteId: number) => {
  const { data: quote, error: quoteError } = await supabase.from('quote').select('*').eq('id', quoteId).single();
  if (quoteError || !quote) throw new Error(quoteError?.message ?? 'Quote not found');

  const { data: quoteProducts, error: productsError } = await supabase
    .from('quote_product')
    .select('*')
    .eq('quote_id', quoteId);
  if (productsError) throw new Error(productsError.message);

  const invoicePayload: InvoiceInsert = {
    client_id: quote.client_id,
    user_id: quote.user_id,
    user_email: quote.user_email,
    status: 'new',
    notes: quote.notes,
    total_value: quote.total_value,
    total_vat: quote.total_vat,
    quote_id: quoteId,
  };

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoice')
    .insert(invoicePayload)
    .select()
    .single();
  if (invoiceError || !invoice) throw new Error(invoiceError?.message ?? 'Failed to create invoice');

  const invoiceId = invoice.id;
  if (!invoiceId) throw new Error('Failed to create invoice entry in database.');

  const invoiceProductsPayload: InvoiceProductWithInvoiceId[] = quoteProducts.map((product) => ({
    name: product.name,
    total_value: product.total_value,
    total_vat: product.total_vat,
    description: product.description ?? '',
    invoice_id: invoice.id,
    markup: product.markup,
    product_id: product.product_id,
    quantity: product.quantity ?? 1,
    value: product.value,
    vat_rate: product.vat_rate,
  }));

  const { error: invoiceProductsError } = await supabase.from('invoice_product').insert(invoiceProductsPayload);
  if (invoiceProductsError) {
    await supabase.from('invoice').delete().eq('id', invoiceId);
    throw new Error('Failed to add invoice products to database. Invoice creation rolled back.');
  }

  return { invoiceId, invoiceProductCount: invoiceProductsPayload.length };
};
