import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button, LinkButton } from '@/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { Card, CardContent, CardDescription, CardHeader } from '@/ui/card';
import ErrorCard from '@/lib/errorCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { useEffect, type Dispatch } from 'react';
import { supabase } from '@/lib/supabase';
import type { EditQuoteAction } from '../reducer/editQuoteReducer';

const getClients = async () => {
  const { data, error } = await supabase.from('client').select('id, name, company').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const formSchema = z.object({
  client_id: z.number('Client is required').refine((val) => val > 0, { message: 'Client is required' }),
});

type AddClientProps = {
  clientId: number;
  dispatch: Dispatch<EditQuoteAction>;
};

const AddClient = ({ clientId, dispatch }: AddClientProps) => {
  const {
    data: clients,
    isLoading: clientsLoading,
    isError: isClientsError,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: clientId || 0,
    },
  });

  useEffect(() => {
    if (clientId === 0) return;
    form.reset({ client_id: clientId });
  }, [clientId, clients, form]);

  const watchedClientId = form.watch('client_id');
  const isFormInvalid = !!form.formState.errors.client_id || watchedClientId === 0;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    dispatch({ type: 'SET_CLIENT_ID', clientId: values.client_id });
    dispatch({ type: 'SET_STEP', step: 'AddProducts' });
  };

  const showFieldValueOrPlaceholder = (value: number) => {
    // if field value is truthy show the field value
    // if field value is a empty string show the placeholder
    return value ? String(value) : '';
  };

  if (isClientsError) return <ErrorCard message={'Failed to load clients.'} />;
  if (!clientId) return <ErrorCard message={'Failed to parse client ID'} />;

  return (
    <div className="flex min-h-screen items-start justify-center md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[600px]">
        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl">
          <CardHeader className="rounded-t-xl ">
            <CardDescription className="text-center">
              Click next step to confirm the client selection or select a different client.
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
                        <FormLabel htmlFor="client_id">
                          Client <span className="text-red-500">*</span>
                        </FormLabel>

                        <FormControl>
                          <Select
                            value={showFieldValueOrPlaceholder(field.value)}
                            onValueChange={(clientId) => field.onChange(Number(clientId))}
                            disabled={clientsLoading}
                          >
                            <SelectTrigger
                              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                              aria-invalid={Boolean(form.formState.errors.client_id)}
                              id="client_id"
                            >
                              <SelectValue placeholder={clientsLoading ? 'Loading clients...' : 'Select a client'} />
                            </SelectTrigger>

                            <SelectContent>
                              {clients?.map((client) => (
                                <SelectItem key={client.id} value={String(client.id)} className="truncate ">
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
                </div>

                {/*  Buttons */}
                <div className="relative w-full flex flex-row justify-end gap-2 px-1 md:px-0 pt-4">
                  <LinkButton variant="ghost" size="formButton" to="/view-quotes">
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

export default AddClient;
