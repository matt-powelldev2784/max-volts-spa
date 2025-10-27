import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/ui/card';
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
import type { Dispatch, SetStateAction } from 'react';
import type { Steps } from './stepIndicator';

const notesSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters'),
});

const getClient = async (clientId: number) => {
  const { data, error } = await supabase.from('client').select('*').eq('id', clientId).single();
  if (error) throw new Error(error.message);
  return data as Client;
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
  setNotes: Dispatch<SetStateAction<string>>;
  setStep: Dispatch<SetStateAction<Steps>>;
};

const QuoteSummary = ({ clientId, quoteProducts, notes, setNotes, setStep }: QuoteSummaryProps) => {
  const { user, loading: userIsLoading } = useAuth();
  const userEmail = user?.email;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const totalValue = quoteProducts.reduce((acc, curr) => acc + (curr.total_value || 0), 0);

  const {
    data: client,
    isLoading: isLoadingClient,
    isError: isClientError,
    error: clientError,
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

  if (isLoadingClient) return <LoadingSpinner />;
  if (userIsLoading || !userEmail) return <LoadingSpinner />;
  if (!user) return <ErrorCard message="Unable to access user information. Please login and try again." />;
  if (isClientError) return <ErrorCard message={clientError?.message || 'Failed to load client.'} />;

  const onSubmit = (values: z.infer<typeof notesSchema>) => {
    mutation.mutate({
      quoteInsert: {
        client_id: clientId,
        total_value: totalValue,
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
      <div className="w-full flexCol md:max-w-[600px]">
        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl">
          <CardHeader className="rounded-t-xl">
            <CardDescription className="text-center">
              Check quote details, add notes if required and submit
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 md:px-6 pb-6 pt-4">
            <p className="font-medium text-sm pb-1">Client Name:</p>
            <div className="rounded-md border border-gray-500 bg-gray-50 w-full px-4 py-2 mb-4">
              <div>{client?.name}</div>
            </div>

            <p className="font-medium text-sm pb-1">Quote Total</p>
            <div className="rounded-md border border-gray-500 bg-gray-50 w-full px-4 py-2 mb-4">
              <p>{`£${totalValue.toFixed(2)}`}</p>
            </div>

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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mutation.isError && <FormError message={mutation.error.message} />}

                <div className="relative w-full flex flex-row justify-end gap-2 px-1 md:px-0 pt-4">
                  <Button variant="ghost" size="formButton" onClick={() => setStep('AddProducts')}>
                    Go Back
                  </Button>

                  <Button type="submit" size="formButton" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="text-white" /> : 'Create Quote'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuoteSummary;
