import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button, LinkButton } from '@/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { Card, CardContent, CardDescription, CardHeader } from '@/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import FormError from '@/lib/formError';
import useAuth from '@/lib/useAuth';
import ErrorCard from '@/lib/errorCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import type { Dispatch, SetStateAction } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client, Quote, QuoteInsert } from '@/types/dbTypes';
import type { Steps } from './_stepIndicator';

const createQuote = async (quote: QuoteInsert) => {
  const { data, error } = await supabase.from('quote').insert(quote).select().single();
  if (error) throw new Error(error.message);
  return data as Quote;
};

const getClients = async () => {
  const { data, error } = await supabase.from('client').select('id, name, company').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Client[];
};

const formSchema = z.object({
  client_id: z.number('Client is required').refine((val) => val > 0, { message: 'Client is required' }),
});

type AddClientProps = {
  setStep: Dispatch<SetStateAction<Steps>>;
  setClientId: Dispatch<SetStateAction<number>>;
  setQuoteId: Dispatch<SetStateAction<number>>;
};

const AddClient = ({ setStep, setQuoteId, setClientId }: AddClientProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: clients,
    isLoading: clientsLoading,
    isError: isClientsError,
    error: clientsError,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: createQuote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setQuoteId(data.id);
      setClientId(data.client_id);
      setStep('AddProducts');
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    mutation.mutate({
      client_id: values.client_id,
      status: 'new',
      total_value: 0,
      user_id: user.id,
      user_email: user.email ?? '',
    });
  };

  if (isClientsError) return <ErrorCard message={clientsError?.message || 'Failed to load clients.'} />;
  if (!user?.email) return <ErrorCard message="Unable to access user email. Please login and try again." />;

  return (
    <div className="flex min-h-screen items-start justify-center md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[600px]">
        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl">
          <CardHeader className="rounded-t-xl ">
            {/* <UserPlus className="mx-auto h-12 w-12 text-mv-orange mb-2" />
            <CardTitle className="text-center text-2xl">Select Client</CardTitle> */}
            <CardDescription className="text-center">
              Select a client and click next to start your quote.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 md:px-6 pb-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="relative space-y-4">
                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Client <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={field.value && Number(field.value) > 0 ? String(field.value) : ''}
                            onValueChange={(val) => field.onChange(val === '' ? 0 : Number(val))}
                            disabled={clientsLoading}
                          >
                            <SelectTrigger
                              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                              aria-invalid={Boolean(form.formState.errors.client_id)}
                            >
                              <SelectValue placeholder={clientsLoading ? 'Loading clients...' : 'Select a client'} />
                            </SelectTrigger>

                            <SelectContent>
                              {clients?.map((client) => (
                                <SelectItem key={client.id} value={String(client.id)}>
                                  <span className="block max-w-[230px] md:max-w-[700px] truncate">
                                    {`${client.name} ${client.company}`}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Error Message */}
                {mutation.isError && <FormError message={mutation.error.message} />}

                {/*  Buttons */}
                <div className="w-full flex flex-row justify-center md:justify-end gap-2 pt-4">
                  <LinkButton variant="ghost" size="formButton" to="/view-quotes">
                    <ArrowLeft className="mr-2 h-4 w-4 text-grey-500" />
                    Cancel
                  </LinkButton>

                  <Button type="submit" size="formButton" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="text-white" /> : 'Next Step'}
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

export default AddClient;
