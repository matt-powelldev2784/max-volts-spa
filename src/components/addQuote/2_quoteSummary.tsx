import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, LinkButton } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/ui/form';
import ErrorCard from '@/lib/errorCard';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router';
import LoadingSpinner from '@/ui/LoadingSpinner';
import type { Client, Quote } from '@/types/dbTypes';
import { Textarea } from '@/ui/textarea';

const notesSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters'),
});

type QuoteSummaryProps = {
  quoteId: number;
  clientId: number;
};

const getQuote = async (quoteId: number) => {
  const { data, error } = await supabase.from('quote').select('*').eq('id', quoteId).single();
  if (error) throw new Error(error.message);
  return data as Quote;
};

const getClient = async (clientId: number) => {
  const { data, error } = await supabase.from('client').select('*').eq('id', clientId).single();
  if (error) throw new Error(error.message);
  return data as Client;
};

type UpdateQuoteNotesProps = {
  quoteId: number;
  notes: string;
};

const updateQuoteNotes = async ({ quoteId, notes }: UpdateQuoteNotesProps) => {
  const { error } = await supabase.from('quote').update({ notes, status: 'quoted' }).eq('id', quoteId);
  if (error) throw new Error(error.message);
  return;
};

const QuoteSummary = ({ quoteId, clientId }: QuoteSummaryProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: quote,
    isLoading: isLoadingQuote,
    isError: isQuoteError,
    error: quoteError,
  } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => getQuote(quoteId),
  });

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
      notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: updateQuoteNotes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote', quoteId] });
    },
  });

  const onSubmit = (values: z.infer<typeof notesSchema>) => {
    mutation.mutate({
      quoteId,
      notes: values.notes,
    });
    queryClient.invalidateQueries({ queryKey: ['quotes'] });
    navigate('/view-quotes');
  };

  if (isQuoteError) return <ErrorCard message={quoteError?.message || 'Failed to load quote.'} />;
  if (quote?.total_value === null) return <ErrorCard message="Quote total value is missing." />;
  if (isClientError) return <ErrorCard message={clientError?.message || 'Failed to load client.'} />;

  if (isLoadingQuote || isLoadingClient) return <LoadingSpinner />;

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
              <p>{`£${quote?.total_value.toFixed(2)}`}</p>
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
                        <Textarea {...field} rows={4} placeholder="Notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mutation.isError && <div className="text-red-600 text-sm">{mutation.error.message}</div>}

                <div className="relative w-full flex flex-row justify-end gap-2 px-1 md:px-0 pt-4">
                  <LinkButton variant="ghost" size="formButton" to="/view-quotes">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </LinkButton>

                  <Button type="submit" size="formButton" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="text-white" /> : 'Submit'}
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
