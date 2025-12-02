import { useEffect, type Dispatch } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button, LinkButton } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import ErrorCard from '@/lib/errorCard';
import type { EditInvoiceAction } from '../reducer/editInvoiceReducer';

const getClients = async () => {
  const { data, error } = await supabase
    .from('client')
    .select('id, name, company')
    .eq('is_visible_to_user', true)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const formSchema = z.object({
  client_id: z.number('Client is required').refine((val) => val > 0, { message: 'Client is required' }),
});

type ConfirmClientProps = {
  clientId: number;
  dispatch: Dispatch<EditInvoiceAction>;
};

const ConfirmClient = ({ clientId, dispatch }: ConfirmClientProps) => {
  const {
    data: clients,
    isLoading: isLoadingClients,
    isError: isClientsError,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      client_id: clientId || 0,
    },
  });

  useEffect(() => {
    form.reset({ client_id: clientId });
  }, [clientId, clients, form]);

  const watchedClientId = form.watch('client_id');
  const isFormInvalid = !!form.formState.errors.client_id || watchedClientId === 0;

  const showFieldValueOrPlaceholder = (value: number) => (value ? String(value) : '');

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    dispatch({ type: 'SET_CLIENT_ID', clientId: values.client_id });
    dispatch({ type: 'SET_STEP', step: 'EditProducts' });
  };

  if (isClientsError) return <ErrorCard message="Failed to load clients." />;

  return (
    <div className="flex min-h-screen items-start justify-center md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[600px]">
        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl">
          <CardHeader className="rounded-t-xl">
            <CardDescription className="text-center">
              Pick the client whose invoice you’re updating, then continue to adjust line items.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 md:px-6 pb-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="client_id">
                        Client <span className="text-red-500">*</span>
                      </FormLabel>

                      <FormControl>
                        <Select
                          value={showFieldValueOrPlaceholder(field.value)}
                          onValueChange={(value) => field.onChange(Number(value))}
                          disabled={isLoadingClients}
                        >
                          <SelectTrigger
                            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                            aria-invalid={Boolean(form.formState.errors.client_id)}
                            id="client_id"
                          >
                            <SelectValue placeholder={isLoadingClients ? 'Loading clients...' : 'Select a client'} />
                          </SelectTrigger>

                          <SelectContent>
                            {clients?.map((client) => (
                              <SelectItem key={client.id} value={String(client.id)} className="truncate">
                                {`${client.name} ${client.company}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="relative w-full flex flex-row justify-end gap-2 px-1 md:px-0 pt-4">
                  <LinkButton variant="ghost" size="formButton" to="/view-invoices">
                    Cancel
                  </LinkButton>

                  <Button size="formButton" disabled={isFormInvalid}>
                    Next Step
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

export default ConfirmClient;
