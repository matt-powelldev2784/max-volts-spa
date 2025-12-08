import { useEffect, type Dispatch } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import useAuth from '@/lib/useAuth';
import ErrorCard from '@/lib/errorCard';
import FormError from '@/lib/formError';
import { Button } from '@/ui/button';
import { CardDescription } from '@/ui/card';
import { CardContentTab, CardDescriptionTab, CardHeaderTab, CardTab } from '@/ui/cardTab';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Textarea } from '@/ui/textarea';
import LoadingSpinner from '@/ui/LoadingSpinner';
import {
  INVOICE_STATUS_OPTIONS,
  type Client,
  type Invoice,
  type InvoiceProductInsert,
  type InvoiceStatus,
} from '@/types/dbTypes';
import type { EditInvoiceAction } from '../reducer/editInvoiceReducer';
import { InvoiceProductCard } from './invoiceProductCard';

const notesSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters'),
  status: z.enum(['new', 'invoiced', 'query', 'paid'], {
    error: 'Status is required',
  }),
});

type UpdateInvoiceProps = {
  invoiceInsert: Invoice;
  invoiceProductsInsert: InvoiceProductInsert[];
};

const updateInvoice = async ({ invoiceInsert, invoiceProductsInsert }: UpdateInvoiceProps) => {
  // update invoice
  const { error: invoiceError } = await supabase.from('invoice').update(invoiceInsert).eq('id', invoiceInsert.id);
  if (invoiceError) throw new Error(`Error updating invoice ${invoiceError.message}`);

  // delete existing invoice products
  const { error: deleteError } = await supabase.from('invoice_product').delete().eq('invoice_id', invoiceInsert.id);
  if (deleteError) throw new Error(`Error deleting existing invoice products: ${deleteError.message}`);

  const invoiceProductsPayload = invoiceProductsInsert.map((product) => ({
    ...product,
    invoice_id: invoiceInsert.id,
  }));

  // insert updated invoice products
  const { error: addError } = await supabase.from('invoice_product').insert(invoiceProductsPayload);
  if (addError) throw new Error(`Error updating invoice products: ${addError.message}`);
};

const getClient = async (clientId: number) => {
  const { data, error } = await supabase.from('client').select('*').eq('id', clientId).single();
  if (error) throw new Error(error.message);
  return data;
};

type EditInvoiceSummaryProps = {
  invoiceProducts: InvoiceProductInsert[];
  invoiceData: Invoice;
  clientId: number;
  dispatch: Dispatch<EditInvoiceAction>;
};

const EditInvoiceSummary = ({ invoiceProducts, invoiceData, clientId, dispatch }: EditInvoiceSummaryProps) => {
  const { user, loading: userIsLoading } = useAuth();
  const userEmail = user?.email;
  const queryClient = useQueryClient();

  const {
    data: client,
    isLoading: isLoadingClient,
    isError: isClientError,
  } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClient(clientId),
  });

  const form = useForm<z.infer<typeof notesSchema>>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: invoiceData.notes || '',
      status: invoiceData.status,
    },
  });

  useEffect(() => {
    form.reset({
      notes: invoiceData.notes || '',
      status: invoiceData.status,
    });
  }, [invoiceData, form]);

  const mutation = useMutation({
    mutationFn: updateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice'] });
      window.location.assign('/view-invoices');
    },
  });

  const setNotes = (notes: string) => {
    dispatch({ type: 'SET_NOTES', notes });
  };

  const setStatus = (status: InvoiceStatus) => {
    dispatch({ type: 'SET_INVOICE_DATA', editInvoiceData: { ...invoiceData, status } });
  };

  const goToPreviousStep = () => {
    dispatch({ type: 'SET_STEP', step: 'EditProducts' });
  };

  if (isLoadingClient) return <LoadingSpinner />;
  if (userIsLoading || !userEmail) return <LoadingSpinner />;
  if (!user) return <ErrorCard message="Unable to access user information. Please login and try again." />;
  if (isClientError) return <ErrorCard message="Failed to load client." />;

  const onSubmit = () => {
    mutation.mutate({
      invoiceInsert: {
        ...invoiceData,
        created_at: new Date().toISOString(),
        user_id: user.id,
        user_email: userEmail,
        client_id: clientId,
      },
      invoiceProductsInsert: invoiceProducts,
    });
  };

  return (
    <div className="flex min-h-screen items-start justify-center md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[900px] px-4">
        {client && <ClientCard client={client} />}

        {invoiceProducts.length > 0 && (
          <ProductList invoiceProducts={invoiceProducts} invoiceData={invoiceData} dispatch={dispatch} />
        )}

        <CardTab>
          <CardHeaderTab>
            <CardDescriptionTab>Submit</CardDescriptionTab>
          </CardHeaderTab>

          <CardContentTab>
            <CardDescription className="text-center">
              Review the invoice, add optional notes, then save your changes.
            </CardDescription>

            <Form {...form}>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setStatus(value as InvoiceStatus);
                        }}
                      >
                        <SelectTrigger className="w-full" aria-invalid={Boolean(form.formState.errors.status)}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {INVOICE_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="Notes"
                          onBlur={() => setNotes(field.value)}
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mutation.isError && <FormError message={mutation.error.message} />}

                <div className="relative w-full flex flex-row justify-end gap-2">
                  <Button variant="ghost" size="formButton" onClick={goToPreviousStep}>
                    Go Back
                  </Button>
                  <Button type="submit" size="formButton" disabled={mutation.isPending} className="px-4 md:px-6">
                    {mutation.isPending ? <Loader2 className="text-white animate-spin" /> : 'Update Invoice'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContentTab>
        </CardTab>
      </div>
    </div>
  );
};

type ClientCardProps = {
  client: Client;
};

const ClientCard = ({ client }: ClientCardProps) => {
  const { name, company, email, telephone, address1, address2, city, county, post_code } = client;

  return (
    <CardTab>
      <CardHeaderTab>
        <CardDescriptionTab>Client Details</CardDescriptionTab>
      </CardHeaderTab>

      <CardContentTab className="md:grid-cols-2">
        <div>
          <span className="text-gray-500 text-xs">Name</span>
          <div className="font-semibold text-base text-gray-900">{name}</div>
        </div>

        <div>
          <span className="text-gray-500 text-xs">Company</span>
          <div className="font-semibold text-base text-gray-900">{company || '-'}</div>
        </div>

        <div>
          <span className="text-gray-500 text-xs">Email</span>
          <div className="font-semibold text-base text-gray-900">{email || '-'}</div>
        </div>

        <div>
          <span className="text-gray-500 text-xs">Telephone</span>
          <div className="font-semibold text-base text-gray-900">{telephone || '-'}</div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <span className="text-gray-500 text-xs">Address</span>
          <div className="font-semibold text-base text-gray-900">
            {[address1, address2, city, county, post_code].filter(Boolean).join(', ') || '-'}
          </div>
        </div>
      </CardContentTab>
    </CardTab>
  );
};

type ProductListProps = {
  invoiceProducts: InvoiceProductInsert[];
  invoiceData: Invoice;
  dispatch: Dispatch<EditInvoiceAction>;
};

const ProductList = ({ invoiceProducts, invoiceData, dispatch }: ProductListProps) => {
  const onEditProduct = (index: number) => {
    dispatch({ type: 'OPEN_EDIT_PRODUCT_MODAL', index });
  };

  const onRemoveProduct = (index: number) => {
    dispatch({
      type: 'SET_INVOICE_PRODUCTS',
      invoiceProducts: invoiceProducts.filter((_, i) => i !== index),
    });
  };

  return (
    <CardTab className="w-full">
      <CardHeaderTab>
        <CardDescriptionTab>Products</CardDescriptionTab>
      </CardHeaderTab>

      <CardContentTab>
        {invoiceProducts.map((product, index) => (
          <InvoiceProductCard
            key={index}
            product={product}
            onEditProduct={() => onEditProduct(index)}
            onRemoveProduct={() => onRemoveProduct(index)}
            disabled
          />
        ))}

        <div className="flex flex-col items-end">
          <div className="bg-mv-orange/10 rounded-xl mt-4 px-6 py-4 mb-4 w-full md:w-[308px] flex flex-col items-end gap-4">
            <div className="flex flex-col items-end">
              <span className="text-black text-sm font-medium">VAT Total</span>
              <span className="text-2xl font-bold text-mv-orange">{`£ ${invoiceData.total_vat.toFixed(2)}`}</span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-black text-sm font-medium">Invoice Total</span>
              <span className="text-2xl font-bold text-mv-orange">{`£ ${invoiceData.total_value.toFixed(2)}`}</span>
            </div>
          </div>
        </div>
      </CardContentTab>
    </CardTab>
  );
};

export default EditInvoiceSummary;
