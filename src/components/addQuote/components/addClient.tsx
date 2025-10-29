import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button, LinkButton } from '@/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { Card, CardContent, CardDescription, CardHeader } from '@/ui/card';
import ErrorCard from '@/lib/errorCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import type { Dispatch } from 'react';
import { supabase } from '@/lib/supabase';
import type { AddQuoteAction } from '../reducer/addQuoteReducer';

const getClients = async () => {
  const { data, error } = await supabase.from('client').select('id, name, company').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const formSchema = z.object({
  client_id: z.number('Client is required').refine((val) => val > 0, { message: 'Client is required' }),
});

type AddClientProps = {
  dispatch: Dispatch<AddQuoteAction>;
  clientId: number;
};

const AddClient = ({ dispatch, clientId }: AddClientProps) => {
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
      client_id: clientId || 0,
    },
  });
  const watchedClientId = form.watch('client_id');
  const isFormInvalid = !!form.formState.errors.client_id || watchedClientId === 0;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    dispatch({ type: 'SET_CLIENT_ID', payload: values.client_id });
    dispatch({ type: 'SET_STEP', payload: 'AddProducts' });
  };

  if (isClientsError) return <ErrorCard message={clientsError?.message || 'Failed to load clients.'} />;

  return (
    <div className="flex min-h-screen items-start justify-center md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[600px]">
        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl">
          <CardHeader className="rounded-t-xl ">
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
                            value={Number(field.value) > 0 ? String(field.value) : ''}
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
