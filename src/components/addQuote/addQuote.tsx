import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button, LinkButton } from '@/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FilePlus2, ArrowLeft, Loader2, Trash } from 'lucide-react';
import type { Database } from '@/types/database.types';
import FormError from '@/lib/formError';
import useAuth from '@/lib/useAuth';
import ErrorCard from '@/lib/errorCard';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Input } from '@/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import LoadingSpinner from '@/ui/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { TableCell, TableHead, TableHeader, TableRow, TableBody, Table } from '@/ui/table';

type QuoteInsert = Database['public']['Tables']['quote']['Insert'];
type QuoteProductInsert = Database['public']['Tables']['quote_product']['Insert'];
type Client = Database['public']['Tables']['client']['Row'];
type Quote = Database['public']['Tables']['quote']['Row'];
type Product = Database['public']['Tables']['product']['Row'];

type AddQuoteProps = {
  setStep: Dispatch<SetStateAction<number>>;
  setClientId: Dispatch<SetStateAction<number>>;
  setQuoteId: Dispatch<SetStateAction<number>>;
};

const formSchema = z.object({
  client_id: z.number('Client is required').refine((val) => val > 0, { message: 'Client is required' }),
});

const addQuote = async (quote: QuoteInsert) => {
  const { data, error } = await supabase.from('quote').insert(quote).select().single();
  if (error) throw new Error(error.message);
  return data as Quote;
};

const getClients = async () => {
  const { data, error } = await supabase.from('client').select('id, name, company').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Client[];
};

const getProducts = async () => {
  const { data, error } = await supabase.from('product').select('id, name, value').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Product[];
};

const AddQuote = () => {
  const [quoteId, setQuoteId] = useState(0);
  const [clientId, setClientId] = useState(0);
  const [step, setStep] = useState(0);
  const [quoteProducts, setQuoteProducts] = useState<QuoteProductInsert[]>([]);
  const [isAddProductModalOpen, setIsOpenProductModalOpen] = useState(true);

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isError: isProductsError,
    error: productsError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  if (isLoadingProducts) return <LoadingSpinner />;
  if (isProductsError || productsData === undefined) {
    return <ErrorCard message={productsError?.message || 'Failed to load products.'} />;
  }

  if (step === 0) return <CreateQuote setStep={setStep} setQuoteId={setQuoteId} setClientId={setClientId} />;
  if (step === 1)
    return (
      <>
        <AddProductModal
          isModalOpen={isAddProductModalOpen}
          setIsOpenProductModalOpen={setIsOpenProductModalOpen}
          setQuoteProducts={setQuoteProducts}
          products={productsData}
          quoteId={quoteId}
        />

        <div className="flex mx-auto items-end justify-end w-11/12 mt-4">
          <Button onClick={() => setIsOpenProductModalOpen(true)} className="text-sm h-[34px] mb-4">
            Add Product
          </Button>
        </div>

        <QuoteProductsTable quoteProducts={quoteProducts} setQuoteProducts={setQuoteProducts} />
      </>
    );
};

const addProductSchema = z.object({
  product_id: z.number().refine((val) => val > 0, { message: 'Product is required' }),
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().min(1),
  markup: z.number().min(0),
  vatRate: z.number().min(0),
  totalValue: z.number().min(0),
});

type AddProductModalProps = {
  isModalOpen: boolean;
  setIsOpenProductModalOpen: Dispatch<SetStateAction<boolean>>;
  setQuoteProducts: Dispatch<SetStateAction<QuoteProductInsert[]>>;
  products: Product[];
  quoteId?: number;
};

type GetTotalValueProps = {
  quantity: number;
  value: number;
  markup: number;
  vatRate: number;
};

const getTotalValue = ({ quantity, value, markup, vatRate }: GetTotalValueProps) => {
  return quantity * value * (1 + markup / 100) * (1 + vatRate / 100);
};

const AddProductModal = ({
  isModalOpen,
  setIsOpenProductModalOpen,
  setQuoteProducts,
  products,
  quoteId,
}: AddProductModalProps) => {
  const form = useForm<z.infer<typeof addProductSchema>>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      product_id: 0,
      name: '',
      quantity: 1,
      markup: 100,
      vatRate: 20,
      totalValue: 0,
    },
  });

  const [watchedProductId, watchedQuantity, watchedMarkup, watchedVatRate, watchedTotalValue] = form.watch([
    'product_id',
    'quantity',
    'markup',
    'vatRate',
    'totalValue',
  ]);

  useEffect(() => {
    const totalValue = getTotalValue({
      quantity: watchedQuantity,
      value: products.find((product) => product.id === Number(watchedProductId))?.value || 0,
      markup: watchedMarkup,
      vatRate: watchedVatRate,
    });

    return form.setValue('totalValue', totalValue);
  }, [watchedProductId, watchedQuantity, watchedMarkup, watchedVatRate, form, products]);

  const handleClose = () => {
    setIsOpenProductModalOpen(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof addProductSchema>) => {
    const { quantity, markup, vatRate } = values;
    const value = products.find((product) => product.id === Number(values.product_id))?.value || 0;
    const totalValue = getTotalValue({ quantity, value, markup, vatRate });

    const quoteProductInsert: QuoteProductInsert = {
      ...values,
      quote_id: quoteId ?? 0,
      value: value,
      total_value: totalValue,
    };

    setQuoteProducts((prev) => [...prev, quoteProductInsert]);
    handleClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(val) => {
                        field.onChange(Number(val));
                        form.setValue('name', products.find((product) => product.id === Number(val))?.name || '');
                      }}
                    >
                      <SelectTrigger className="w-full" aria-invalid={form.formState.errors.product_id ? true : false}>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={String(product.id)}>
                            {product.name} (£{product.value})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={1} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                  <FormLabel>Markup (%)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={0} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vatRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT Rate (%)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={0} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-2 font-semibold">Total: £{watchedTotalValue.toFixed(2)}</div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Add Product</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const CreateQuote = ({ setStep, setQuoteId, setClientId }: AddQuoteProps) => {
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
    mutationFn: addQuote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setQuoteId(data.id);
      setClientId(data.client_id);
      setStep(1);
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
    <div className="flex min-h-screen items-start justify-center bg-none md:bg-gray-50 md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[600px]">
        <div className="flexRow gap-4 mt-4 mb-6 md:bg-transparent w-full">
          <LinkButton variant="iconGhost" size="sm" to="/view-quotes">
            <ArrowLeft className="h-6 w-6" />
          </LinkButton>
          <h1 className="text-3xl font-bold text-gray-800">Create Quote</h1>
        </div>

        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl -translate-y-6 md:-translate-y-0">
          <CardHeader className="rounded-t-xl">
            <FilePlus2 className="mx-auto h-12 w-12 text-mv-orange mb-2" />
            <CardTitle className="text-center text-2xl">Select Client</CardTitle>
            <CardDescription className="text-center">
              Select a client and click next to start your quote.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 md:px-6 pb-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-4">
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
                              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-mv-orange focus:outline-none focus:ring-2 focus:ring-mv-orange/20 bg-white"
                              aria-invalid={Boolean(form.formState.errors.client_id)}
                            >
                              <SelectValue placeholder={clientsLoading ? 'Loading clients...' : 'Select a client'} />
                            </SelectTrigger>

                            <SelectContent>
                              {clients?.map((client) => (
                                <SelectItem key={client.id} value={String(client.id)}>
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

                {/* Error Message */}
                {mutation.isError && <FormError message={mutation.error.message} />}

                {/*  Buttons */}
                <div className="flexCol gap-2 pt-4">
                  <Button type="submit" size="lgFullWidth" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="text-white" /> : 'Create Quote'}
                  </Button>

                  <LinkButton variant="ghost" size="lgFullWidth" to="/view-quotes">
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

type QuoteProductsTableProps = {
  quoteProducts: QuoteProductInsert[];
  setQuoteProducts: Dispatch<SetStateAction<QuoteProductInsert[]>>;
};

export const QuoteProductsTable = ({ quoteProducts, setQuoteProducts }: QuoteProductsTableProps) => {
  const onRemove = (index: number) => {
    setQuoteProducts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-11/12 mx-auto">
      <div className="overflow-x-auto">
        {/* Desktop Table */}
        <Table className="hidden md:table table-fixed">
          <TableHeader>
            <TableRow className="bg-neutral-100">
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-80">Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit value</TableHead>
              <TableHead>Markup %</TableHead>
              <TableHead>VAT %</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {quoteProducts.map((quoteProduct, index) => (
              <TableRow key={`${quoteProduct.product_id}-${index}`}>
                {/* Remove button first */}
                <TableCell>
                  <Button
                    size="sm"
                    className="w-[25px] h-[25px] bg-mv-orange rounded"
                    onClick={() => onRemove(index)}
                    aria-label="Remove product"
                  >
                    <Trash className="h-4 w-4 text-white" />
                  </Button>
                </TableCell>

                <TableCell>{quoteProduct.name}</TableCell>
                <TableCell>{quoteProduct.quantity}</TableCell>
                <TableCell>{quoteProduct.value}</TableCell>
                <TableCell>{quoteProduct.markup}</TableCell>
                <TableCell>{quoteProduct.vat_rate}</TableCell>
                <TableCell className="font-bold">{`£ ${quoteProduct.total_value}`}</TableCell>
              </TableRow>
            ))}

            {quoteProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center align-middle">
                  No products added.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Mobile Table */}
        <Table className="table md:hidden table-fixed">
          <TableHeader>
            <TableRow className="bg-neutral-100">
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-1/2">Product</TableHead>
              <TableHead className="w-24">Total</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {quoteProducts.map((quoteProduct, index) => (
              <TableRow key={`${quoteProduct.product_id}-${index}`}>
                <TableCell>
                  <Button
                    size="sm"
                    className="w-[25px] h-[25px] bg-mv-orange rounded"
                    onClick={() => onRemove(index)}
                    aria-label="Remove product"
                  >
                    <Trash className="h-4 w-4 text-white" />
                  </Button>
                </TableCell>

                <TableCell>{quoteProduct.name}</TableCell>
                <TableCell className="font-bold">{`£ ${quoteProduct.total_value}`}</TableCell>
              </TableRow>
            ))}

            {quoteProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center align-middle">
                  No products added.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AddQuote;
