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
import { PackagePlus, ArrowLeft, Loader2 } from 'lucide-react';
import type { Database } from '@/types/database.types';
import FormError from '@/lib/formError';

type ProductInsert = Database['public']['Tables']['product']['Insert'];

const formSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  value: z.string().regex(/^(0|[1-9]\d*)\.\d{2}$/, { message: 'Must be a number with exactly 2 decimal places' }),
});

const addProduct = async (product: ProductInsert) => {
  const { data, error } = await supabase.from('product').insert(product);

  if (error) {
    throw new Error(error.message);
  }

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
        <div className="flexRow gap-4 mt-4 mb-6 md:bg-transparent w-full">
          <LinkButton variant="iconGhost" size="sm" to="/view-products">
            <ArrowLeft className="h-6 w-6" />
          </LinkButton>
          <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
        </div>

        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl -translate-y-6 md:-translate-y-0">
          <CardHeader className="rounded-t-xl">
            <PackagePlus className="mx-auto h-12 w-12 text-mv-orange mb-2" />
            <CardTitle className="text-center text-2xl">Product Details</CardTitle>
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
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Value £<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Value £s" {...field} />
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
                    {mutation.isPending ? <Loader2 className="text-white" /> : 'Add Product'}
                  </Button>

                  <LinkButton variant="ghost" size="lgFullWidth" to="/view-products">
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

export default AddProduct;
