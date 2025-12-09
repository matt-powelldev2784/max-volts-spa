import { useEffect, type Dispatch } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StretchHorizontal } from 'lucide-react';
import { Button } from '@/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { Input } from '@/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import type { EditInvoiceAction } from '../reducer/editInvoiceReducer';
import type { InvoiceProductForEditInvoice, Product } from '@/types/dbTypes';
import { getTotalProductValue, getTotalProductVat } from '@/lib/quoteCalculator';

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
  invoiceProducts: InvoiceProductForEditInvoice[];
  dispatch: Dispatch<EditInvoiceAction>;
};

const AddProductModal = ({ isModalOpen, products, invoiceProducts, dispatch }: AddProductModalProps) => {
  const visibleProducts = products.filter((product) => product.is_visible_to_user);

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

  const [watchedProductId, watchedQuantity, watchedMarkup, watchedVatRate, watchedTotalValue] = form.watch([
    'product_id',
    'quantity',
    'markup',
    'vat_rate',
    'total_value',
  ]);

  useEffect(() => {
    const selectedProduct = products.find((product) => product.id === Number(watchedProductId));
    if (selectedProduct) {
      form.setValue('description', selectedProduct.description ?? '');
      form.setValue('name', selectedProduct.name);
      form.setValue('value', selectedProduct.value);
      form.setValue('markup', selectedProduct.markup);
      form.setValue('vat_rate', selectedProduct.vat);
    }
  }, [watchedProductId, products, form]);

  useEffect(() => {
    const selectedProduct = products.find((product) => product.id === Number(watchedProductId));
    const value = selectedProduct?.value ?? 0;

    const totalValue = getTotalProductValue({
      quantity: watchedQuantity,
      value,
      markup: watchedMarkup,
      vat_rate: watchedVatRate,
    });

    const totalVat = getTotalProductVat({
      quantity: watchedQuantity,
      value,
      markup: watchedMarkup,
      vat_rate: watchedVatRate,
    });

    form.setValue('total_value', totalValue);
    form.setValue('total_vat', totalVat);
  }, [watchedProductId, watchedQuantity, watchedMarkup, watchedVatRate, form, products]);

  const handleClose = () => {
    form.reset();
    dispatch({ type: 'CLOSE_ADD_PRODUCT_MODAL' });
  };

  const onSubmit = (values: z.infer<typeof addProductSchema>) => {
    const value = products.find((product) => product.id === Number(values.product_id))?.value || 0;

    const invoiceProductInsert: InvoiceProductForEditInvoice = {
      ...values,
      value: value,
    };

    dispatch({
      type: 'SET_INVOICE_PRODUCTS',
      invoiceProducts: [...invoiceProducts, invoiceProductInsert],
    });

    handleClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-full h-full max-w-none rounded-none overflow-y-auto sm:max-w-lg sm:rounded-2xl sm:h-auto">
        <DialogHeader className="flexCol">
          <StretchHorizontal className="h-6 w-6 md:h-8 md:w-8 text-mv-orange" />
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
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger
                        className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                        aria-invalid={Boolean(form.formState.errors.product_id)}
                      >
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>

                      <SelectContent>
                        {visibleProducts.map((product) => (
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
                    <Input type="number" min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                      <Input type="number" disabled className="bg-gray-100 text-black pl-6" {...field} />
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
                    <Input type="number" min={0} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                    <Input type="number" min={0} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                Add Product
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
