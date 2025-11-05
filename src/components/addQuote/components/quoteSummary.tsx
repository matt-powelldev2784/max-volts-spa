import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/ui/button';
import { CardDescription } from '@/ui/card';
import { Loader2 } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/ui/form';
import ErrorCard from '@/lib/errorCard';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router';
import LoadingSpinner from '@/ui/LoadingSpinner';
import type { Client, QuoteInsert, QuoteProductInsert } from '@/types/dbTypes';
import { Textarea } from '@/ui/textarea';
import useAuth from '@/lib/useAuth';
import FormError from '@/lib/formError';
import type { Dispatch } from 'react';
import type { AddQuoteAction } from '../reducer/addQuoteReducer';
import { CardContentTab, CardDescriptionTab, CardHeaderTab, CardTab } from '@/ui/cardTab';
import { QuoteProductCard } from './quoteProductCard';

const notesSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters'),
});

const getClient = async (clientId: number) => {
  const { data, error } = await supabase.from('client').select('*').eq('id', clientId).single();
  if (error) throw new Error(error.message);
  return data; 
};

type CreateQuoteProps = {
  quoteProductsInsert: QuoteProductInsert[];
  quoteInsert: QuoteInsert;
};

const createQuote = async ({ quoteProductsInsert, quoteInsert }: CreateQuoteProps) => {
  // add quote db entry
  const { data: quoteData, error: quoteError } = await supabase.from('quote').insert(quoteInsert).select().single();
  if (quoteError) throw new Error(quoteError.message);
  const quoteId = quoteData.id;
  if (!quoteId) throw new Error('Failed to create quote entry in database.');

  // add quote products db entries
  const { data: quoteProductData, error: QuoteProductError } = await supabase
    .from('quote_product')
    .insert(
      quoteProductsInsert.map((quoteProduct) => ({
        ...quoteProduct,
        quote_id: quoteId,
      }))
    )
    .select();

  if (QuoteProductError) {
    await supabase.from('quote').delete().eq('id', quoteId);
    throw new Error('Failed to add quote products to database.');
  }

  return { quoteData, quoteProductData };
};

type QuoteSummaryProps = {
  clientId: number;
  quoteProducts: QuoteProductInsert[];
  notes: string;
  dispatch: Dispatch<AddQuoteAction>;
};

const QuoteSummary = ({ clientId, quoteProducts, notes, dispatch }: QuoteSummaryProps) => {
  const { user, loading: userIsLoading } = useAuth();
  const userEmail = user?.email;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const totalValue = quoteProducts.reduce((acc, curr) => acc + (curr.total_value || 0), 0);
  const totalVat = quoteProducts.reduce((acc, curr) => acc + (curr.total_vat || 0), 0);

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
      notes: notes || '',
    },
  });

  const mutation = useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote'] });
      navigate('/view-quotes');
    },
  });

  const setNotes = (notes: string) => {
    dispatch({ type: 'SET_NOTES', payload: notes });
  };

  const goToPreviousStep = () => {
    dispatch({ type: 'SET_STEP', payload: 'AddProducts' });
  };

  if (isLoadingClient) return <LoadingSpinner />;
  if (userIsLoading || !userEmail) return <LoadingSpinner />;
  if (!user) return <ErrorCard message="Unable to access user information. Please login and try again." />;
  if (isClientError) return <ErrorCard message={'Failed to load client.'} />;

  const onSubmit = (values: z.infer<typeof notesSchema>) => {
    mutation.mutate({
      quoteInsert: {
        client_id: clientId,
        total_value: totalValue,
        total_vat: totalVat,
        user_id: user.id,
        user_email: userEmail,
        notes: values.notes,
        status: 'quoted',
      },
      quoteProductsInsert: quoteProducts.map((product) => ({
        ...product,
      })),
    });
  };

  return (
    <div className="flex min-h-screen items-start justify-center md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[900px] px-4">
        {client && <ClientCard client={client} />}

        {quoteProducts.length > 0 && (
          <ProductList quoteProducts={quoteProducts} totalValue={totalValue} totalVat={totalVat} dispatch={dispatch} />
        )}

        <CardTab>
          <CardHeaderTab>
            <CardDescriptionTab>Submit</CardDescriptionTab>
          </CardHeaderTab>

          <CardContentTab>
            <CardDescription className="text-center">
              Check quote details, add notes if required and then click create quote.
            </CardDescription>

            <Form {...form}>
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
                          onBlur={() => {
                            setNotes(field.value);
                          }}
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
                    {mutation.isPending ? <Loader2 className="text-white" /> : 'Create Quote'}
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
  quoteProducts: QuoteProductInsert[];
  totalVat: number;
  totalValue: number;
  dispatch: Dispatch<AddQuoteAction>;
};

const ProductList = ({ quoteProducts, totalVat, totalValue, dispatch }: ProductListProps) => {
  const onEditProduct = (index: number) => {
    dispatch({ type: 'OPEN_EDIT_PRODUCT_MODAL', payload: { index, isOpen: true } });
  };

  const onRemoveProduct = (index: number) => {
    dispatch({ type: 'SET_QUOTE_PRODUCTS', payload: quoteProducts.filter((_, i) => i !== index) });
  };

  return (
    <CardTab className="w-full">
      <CardHeaderTab>
        <CardDescriptionTab>Products</CardDescriptionTab>
      </CardHeaderTab>

      <CardContentTab>
        {quoteProducts.map((product, index) => (
          <QuoteProductCard
            key={index}
            product={product}
            onEditProduct={() => onEditProduct(index)}
            onRemoveProduct={() => onRemoveProduct(index)}
            disabled={true}
          />
        ))}

        <div className="flex flex-col items-end">
          <div className="bg-mv-orange/10 rounded-xl mt-4 px-6 py-4 mb-4 w-full md:w-[308px] flex flex-col items-end gap-4">
            <div className="flex flex-col items-end">
              <span className="text-black text-sm font-medium">VAT Total</span>
              <span className="text-2xl font-bold text-mv-orange">{`£ ${totalVat.toFixed(2)}`}</span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-black text-sm font-medium">Quote Total</span>
              <span className="text-2xl font-bold text-mv-orange">{`£ ${totalValue.toFixed(2)}`}</span>
            </div>
          </div>
        </div>
      </CardContentTab>
    </CardTab>
  );
};

export default QuoteSummary;
