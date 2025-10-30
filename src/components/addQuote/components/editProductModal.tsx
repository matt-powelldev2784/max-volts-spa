import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { useEffect, type Dispatch } from 'react';
import { Input } from '@/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import type { Product, QuoteProductInsert } from '@/types/dbTypes';
import { StretchHorizontal } from 'lucide-react';
import type { AddQuoteAction } from '../reducer/addQuoteReducer';
import { getTotalValue, getTotalVat } from '@/lib/quoteCalculator';

const addProductSchema = z.object({
  product_id: z.number().refine((val) => val > 0, { message: 'Product is required' }),
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().min(1),
  value: z.number().min(0),
  markup: z.number().min(0),
  vat_rate: z.number().min(0),
  total_value: z.number().min(0),
  total_vat: z.number().min(0),
  description: z.string().optional(),
});

type AddProductModalProps = {
  isModalOpen: boolean;
  products: Product[];
  quoteProducts: QuoteProductInsert[];
  selectedQuoteProductIndex: number | null;
  dispatch: Dispatch<AddQuoteAction>;
};

const EditProductModal = ({
  isModalOpen,
  quoteProducts,
  products,
  selectedQuoteProductIndex,
  dispatch,
}: AddProductModalProps) => {
  const form = useForm<z.infer<typeof addProductSchema>>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      product_id: 0,
      name: '',
      quantity: 1,
      value: 0,
      markup: 0,
      vat_rate: 0,
      total_value: 0,
      total_vat: 0,
      description: '',
    },
  });

  useEffect(() => {
    if (selectedQuoteProductIndex != null) {
      const quoteProduct = quoteProducts[selectedQuoteProductIndex];

      form.setValue('product_id', quoteProduct.product_id);
      form.setValue('name', quoteProduct.name);
      form.setValue('quantity', quoteProduct.quantity || 1);
      form.setValue('value', quoteProduct.value || 0);
      form.setValue('markup', quoteProduct.markup || 0);
      form.setValue('vat_rate', quoteProduct.vat_rate || 0);
      form.setValue('description', quoteProduct.description || '');
    }
  }, [selectedQuoteProductIndex, form, quoteProducts]);

  const [watchedProductId, watchedQuantity, watchedMarkup, watchedVatRate, watchedValue, watchedTotalValue] =
    form.watch(['product_id', 'quantity', 'markup', 'vat_rate', 'value', 'total_value']);

  // Recalculate total value and total VAT when the related product values change
  useEffect(() => {
    const total_value = getTotalValue({
      quantity: watchedQuantity,
      value: watchedValue,
      markup: watchedMarkup,
      vat_rate: watchedVatRate,
    });

    const total_vat = getTotalVat({
      quantity: watchedQuantity,
      value: products.find((product) => product.id === Number(watchedProductId))?.value || 0,
      markup: watchedMarkup,
      vat_rate: watchedVatRate,
    });

    form.setValue('total_value', total_value);
    form.setValue('total_vat', total_vat);
  }, [watchedProductId, watchedQuantity, watchedValue, watchedMarkup, watchedVatRate, form, products]);

  const handleClose = () => {
    form.reset();
    dispatch({ type: 'CLOSE_EDIT_PRODUCT_MODAL', payload: { isOpen: false, selectedQuoteProductIndex: null } });
  };

  const onSubmit = (values: z.infer<typeof addProductSchema>) => {
    const value = products.find((product) => product.id === Number(values.product_id))?.value || 0;

    const updatedQuoteProduct = {
      ...values,
      value: value,

    };

    const updatedQuoteProducts = quoteProducts.map((quoteProduct, index) =>
      index === selectedQuoteProductIndex ? updatedQuoteProduct : quoteProduct
    );

    dispatch({
      type: 'SET_QUOTE_PRODUCTS',
      payload: updatedQuoteProducts,
    });

    handleClose();
  };

  if (selectedQuoteProductIndex === null) return;
  const selectedProductId = quoteProducts[selectedQuoteProductIndex].product_id.toString();

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-full h-full max-w-none rounded-none overflow-y-auto sm:max-w-lg sm:rounded-2xl sm:h-auto">
        <DialogHeader className="flexCol">
          <StretchHorizontal className="h-6 w-6 md:h-8 md:w-8 text-mv-orange" />
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="product_id"
              render={() => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <FormControl>
                    <Select value={selectedProductId} disabled={selectedQuoteProductIndex !== null}>
                      <SelectTrigger
                        className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                        aria-invalid={form.formState.errors.product_id ? true : false}
                      >
                        <SelectValue placeholder={quoteProducts[selectedQuoteProductIndex].name} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={String(product.id)}>
                            <span className="block max-w-[230px] md:max-w-[700px] truncate">{product.name}</span>
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
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-[12.75px] text-gray-700 pointer-events-none">
                        £
                      </span>
                      <Input {...field} type="number" disabled className="bg-gray-100 text-black pl-6" />
                    </div>
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

            <div className="relative w-full flex flex-row justify-end gap-2 px-1 md:px-0 pt-4">
              <Button type="button" variant="ghost" size="formButton" onClick={handleClose}>
                Cancel
              </Button>

              <Button type="submit" size="formButton">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
