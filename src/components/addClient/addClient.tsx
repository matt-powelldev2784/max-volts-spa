import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, LinkButton } from '@/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { Input } from '@/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router';
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import type { Database } from '@/types/database.types';
import FormError from '@/lib/formError';

type ClientInsert = Database['public']['Tables']['client']['Insert'];

const formSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  company: z.string().optional(),
  email: z.email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  telephone: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  post_code: z.string().optional(),
});

const addClient = async (client: ClientInsert) => {
  const { data, error } = await supabase.from('client').insert(client);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const AddClient = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      telephone: '',
      address1: '',
      address2: '',
      city: '',
      county: '',
      post_code: '',
    },
  });

  const mutation = useMutation({
    mutationFn: addClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigate('/view-clients');
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-none md:bg-gray-50 md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[600px]">
        <div className="flexRow gap-4 mt-4 mb-6  md:bg-transparent w-full">
          <LinkButton variant="iconGhost" size="sm" to="/view-clients">
            <ArrowLeft className="h-6 w-6" />
          </LinkButton>
          <h1 className="text-3xl font-bold text-gray-800">Add New Client</h1>
        </div>

        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl -translate-y-6 md:-translate-y-0">
          <CardHeader className="rounded-t-xl">
            <UserPlus className="mx-auto h-12 w-12 text-mv-orange mb-2" />
            <CardTitle className="text-center text-2xl">Client Details</CardTitle>
            <CardDescription className="text-center">
              Fill in the form below and click submit to add a new client.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 md:px-6 pb-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem className="relative pb-2">
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Company" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="relative pb-2">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem className="relative pb-2">
                        <FormLabel>Telephone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Telephone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address1"
                    render={({ field }) => (
                      <FormItem className="relative pb-2">
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input placeholder="Address Line 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address2"
                    render={({ field }) => (
                      <FormItem className="relative pb-2">
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input placeholder="Address Line 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="relative pb-2">
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="county"
                    render={({ field }) => (
                      <FormItem className="relative pb-2">
                        <FormLabel>County</FormLabel>
                        <FormControl>
                          <Input placeholder="County" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="post_code"
                    render={({ field }) => (
                      <FormItem className="relative pb-2">
                        <FormLabel>Post Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Post Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Error Message */}
                {mutation.isError && <FormError message={mutation.error.message} />}

                {/*  Buttons */}
                <div className="flexCol gap-2 pt-4">
                  <Button type="submit" size="lgFullWidth" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="text-white" /> : 'Add Client'}
                  </Button>

                  <LinkButton variant="ghost" size="lgFullWidth" to="/view-clients">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </LinkButton>
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
