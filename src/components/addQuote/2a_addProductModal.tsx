import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { Input } from '@/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import type { Product, QuoteProductInsert } from '@/types/dbTypes';

const addProductSchema = z.object({
  product_id: z.number().refine((val) => val > 0, { message: 'Product is required' }),
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().min(1),
  markup: z.number().min(0),
  vat_rate: z.number().min(0),
  total_value: z.number().min(0),
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
  vat_rate: number;
};

const getTotalValue = ({ quantity, value, markup, vat_rate }: GetTotalValueProps) => {
  return quantity * value * (1 + markup / 100) * (1 + vat_rate / 100);
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
      vat_rate: 20,
      total_value: 0,
    },
  });

  const [watchedProductId, watchedQuantity, watchedMarkup, watchedVatRate, watchedTotalValue] = form.watch([
    'product_id',
    'quantity',
    'markup',
    'vat_rate',
    'total_value',
  ]);

  useEffect(() => {
    const total_value = getTotalValue({
      quantity: watchedQuantity,
      value: products.find((product) => product.id === Number(watchedProductId))?.value || 0,
      markup: watchedMarkup,
      vat_rate: watchedVatRate,
    });

    return form.setValue('total_value', total_value);
  }, [watchedProductId, watchedQuantity, watchedMarkup, watchedVatRate, form, products]);

  const handleClose = () => {
    setIsOpenProductModalOpen(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof addProductSchema>) => {
    const { quantity, markup, vat_rate } = values;
    const value = products.find((product) => product.id === Number(values.product_id))?.value || 0;
    const total_value = getTotalValue({ quantity, value, markup, vat_rate });

    const quoteProductInsert: QuoteProductInsert = {
      ...values,
      quote_id: quoteId ?? 0,
      value: value,
      total_value: total_value,
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
              name="vat_rate"
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

export default AddProductModal;
