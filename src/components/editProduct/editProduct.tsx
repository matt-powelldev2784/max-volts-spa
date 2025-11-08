import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button, LinkButton } from '@/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { Input } from '@/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import LoadingSpinner from '@/ui/LoadingSpinner';
import FormError from '@/lib/formError';
import { ArrowLeft, EllipsisVertical, Loader2, StretchHorizontal, Trash } from 'lucide-react';
import type { ProductInsert } from '@/types/dbTypes';
import { useEffect, useState } from 'react';
import { Textarea } from '@/ui/textarea';
import ErrorCard from '@/lib/errorCard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';

const getProductById = async (productId: number) => {
  const { data, error } = await supabase.from('product').select('*').eq('id', productId).single();
  if (error) throw new Error(error.message);
  return data;
};

const deleteProduct = async (productId: number) => {
  const { data, error } = await supabase.from('product').delete().eq('id', productId);
  if (error) throw new Error('Server Error. Product deletion failed. Please try again later.');
  return data;
};

type UpdateProductProps = {
  productId: number;
  updateData: ProductInsert;
};

const updateProduct = async ({ productId, updateData }: UpdateProductProps) => {
  const { data, error } = await supabase.from('product').update(updateData).eq('id', productId);
  if (error) throw new Error(error.message);
  return data;
};

const formSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  value: z.string().regex(/^(0|[1-9]\d*)\.\d{2}$/, { message: 'Number must have 2 decimal places' }),
  description: z.string().optional(),
  markup: z.number().min(0),
  vat: z.number().min(0),
});

type EditProductProps = {
  productId: number;
};

const EditProduct = ({ productId }: EditProductProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
  });

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

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        value: product.value.toFixed(2),
        description: product.description || '',
        markup: product.markup,
        vat: product.vat,
      });
    }
  }, [product, form]);

  const mutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/view-products');
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const productValue = values.value.toString();

    mutation.mutate({ productId, updateData: { ...values, value: Number(productValue) } });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorCard message={'Failed to load product.'} />;
  if (!productId) return <ErrorCard message="No product ID provided." />;

  return (
    <div className="flex min-h-screen items-start justify-center bg-none md:bg-gray-50 md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[600px]">
        {/*  Title */}
        <div className="flexRow gap-4 mt-4 mb-6 md:bg-transparent w-full ">
          <div className="rounded-full bg-mv-orange w-10 h-10 flexCol">
            <StretchHorizontal className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-center text-2xl">Edit Product</CardTitle>
        </div>

        {/* Form */}
        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl -translate-y-6 md:-translate-y-0">
          <CardHeader className="rounded-t-xl ">
            <CardDescription className="text-center">
              Update the product details below and click save to apply changes.
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
                          <Textarea placeholder="Description" rows={3} {...field} />
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
                  <DeleteProductDropDown productId={productId} />

                  <LinkButton variant="ghost" size="formButton" to="/view-products" className="hide-xs">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </LinkButton>

                  <Button type="submit" size="formButton" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="text-white" /> : 'Save Changes'}
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

type DeleteProductDropDownProps = {
  productId: number;
};

const DeleteProductDropDown = ({ productId }: DeleteProductDropDownProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="w-full flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="Delete product actions">
              <EllipsisVertical className="h-6 w-6 md:h-8 md:w-8 text-mv-orange" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="center" className="p-1 min-w-[90px]">
            <div className="flex flex-col">
              <DropdownMenuItem className="flex items-center gap-5 px-4 py-2" onClick={handleOpenModal}>
                <Trash className="size-6 text-mv-orange" />
                <p className="text-xl mr-2">Delete Product</p>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDeleteProductModal isOpen={isModalOpen} productId={productId} handleCloseModal={handleCloseModal} />
    </>
  );
};

type ConfirmDeleteProductModalProps = {
  isOpen: boolean;
  productId: number;
  handleCloseModal: () => void;
};

const ConfirmDeleteProductModal = ({ isOpen, productId, handleCloseModal }: ConfirmDeleteProductModalProps) => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: () => {
      navigate('/view-products');
    },
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleCloseModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-none rounded-2xl overflow-y-auto w-11/12 md:w-auto">
        <DialogHeader className="flexCol">
          <Trash className="h-6 w-6 md:h-8 md:w-8 text-mv-orange" />
          <DialogTitle>Delete Product</DialogTitle>
        </DialogHeader>

        <p className="py-4 text-center">Are you sure you want to delete this product? This action cannot be undone.</p>

        {mutation.isError && <FormError message={mutation.error.message} />}

        <div className="relative w-full flex flex-row justify-end gap-2 px-1 md:px-0 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="formButton"
            onClick={handleCloseModal}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="formButton"
            onClick={handleDelete}
            disabled={mutation.isPending}
            isLoading={mutation.isPending}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProduct;
