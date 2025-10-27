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
import { ArrowLeft, Loader2, StretchHorizontal } from 'lucide-react';
import type { Database } from '@/types/database.types';
import FormError from '@/lib/formError';

type ProductInsert = Database['public']['Tables']['product']['Insert'];

const formSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  value: z.string().regex(/^(0|[1-9]\d*)\.\d{2}$/, { message: 'Number must have 2 decimal places' }),
  description: z.string().optional(),
  markup: z.number().min(0),
  vat: z.number().min(0),
});

const addProduct = async (product: ProductInsert) => {
  const { data, error } = await supabase.from('product').insert(product);
  if (error) throw new Error(error.message);
  return data;
};

const AddProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      value: '',
      description: '',
      markup: 100,
      vat: 20,
    },
  });

  const mutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/view-products');
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate({ ...values, value: Number(values.value) });
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-none md:bg-gray-50 md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[600px]">
        {/*  Title */}
        <div className="flexRow gap-4 mt-4 mb-6 md:bg-transparent w-full">
          <div className="rounded-full bg-mv-orange w-10 h-10 flexCol">
            <StretchHorizontal className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-center text-2xl">Add Product</CardTitle>
        </div>

        {/* Form */}
        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl -translate-y-6 md:-translate-y-0">
          <CardHeader className="rounded-t-xl">
            <CardDescription className="text-center">
              Fill in the form below and click submit to add a new product.
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <textarea
                            className="block w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900 shadow-xs transition focus:border-2 focus:outline-none"
                            placeholder="Description"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Value<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-[10px] text-black text-sm">£</span>
                            <Input
                              {...field}
                              type="number"
                              className="pl-6 "
                              placeholder="Value"
                              aria-invalid={!!form.formState.errors.value}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="markup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Default Markup % <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Markup"
                            {...field}
                            min={0}
                            step="any"
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            aria-invalid={!!form.formState.errors.markup}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Default VAT % <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="VAT"
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            aria-invalid={!!form.formState.errors.vat}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Error Message */}
                {mutation.isError && <FormError message={mutation.error.message} />}

                {/*  Buttons */}
                <div className="relative w-full flex flex-row justify-end gap-2 px-1 md:px-0 pt-4">
                  <LinkButton variant="ghost" size="formButton" to="/view-products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </LinkButton>

                  <Button type="submit" size="formButton" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="text-white" /> : 'Add Product'}
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

export default AddProduct;
