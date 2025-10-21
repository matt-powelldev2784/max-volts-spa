import { Button, LinkButton } from '@/ui/button';
import { ArrowLeft, Loader2, StretchHorizontal, Trash } from 'lucide-react';
import { type Dispatch, type SetStateAction } from 'react';
import { TableCell, TableHead, TableHeader, TableRow, TableBody, Table } from '@/ui/table';
import type { QuoteProductInsert } from '@/types/dbTypes';
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormError from '@/lib/formError';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/card';

type QuoteProductsTableProps = {
  quoteId: number;
  quoteProducts: QuoteProductInsert[];
  setQuoteProducts: Dispatch<SetStateAction<QuoteProductInsert[]>>;
  setIsOpenProductModalOpen: Dispatch<SetStateAction<boolean>>;
  setStep: Dispatch<SetStateAction<number>>;
};

const addQuoteProducts = async (quoteProducts: QuoteProductInsert[]) => {
  if (quoteProducts.length === 0) throw new Error('Please add at least one product to the quote and try again.');
  const { data, error } = await supabase.from('quote_product').insert(quoteProducts).select();
  if (error) throw new Error(error.message);
  return data;
};

const updateQuoteTotal = async ({ quoteId, total_value }: { quoteId: number; total_value: number }) => {
  const { error } = await supabase.from('quote').update({ total_value }).eq('id', quoteId);
  if (error) throw new Error(error.message);
  return total_value;
};

type UpdateQuotesProps = {
  quoteId: number;
  quoteProducts: QuoteProductInsert[];
  totalValue: number;
};

const updateQuote = async ({ quoteId, quoteProducts, totalValue }: UpdateQuotesProps) => {
  const data = await addQuoteProducts(quoteProducts);
  if (!data) throw new Error('Failed to add products to quote.');
  await updateQuoteTotal({ quoteId, total_value: totalValue });
};

export const QuoteProductsTable = ({
  quoteId,
  quoteProducts,
  setQuoteProducts,
  setIsOpenProductModalOpen,
  setStep,
}: QuoteProductsTableProps) => {
  const queryClient = useQueryClient();

  const totalValue = quoteProducts.reduce((acc, curr) => {
    return acc + (curr.total_value || 0);
  }, 0);

  const mutation = useMutation({
    mutationFn: updateQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', 'quoteProducts'] });
      setStep(3);
    },
  });

  const onSubmit = () => {
    mutation.mutate({ quoteId, quoteProducts, totalValue });
  };

  const onRemove = (index: number) => {
    setQuoteProducts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-none md:bg-gray-50 md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[900px]">
        <div className="flexRow gap-4 mt-4 mb-6 md:bg-transparent w-full">
          <LinkButton variant="iconGhost" size="sm" to="/view-quotes">
            <ArrowLeft className="h-6 w-6" />
          </LinkButton>
          <h1 className="text-3xl font-bold text-gray-800">Create Quote</h1>
        </div>

        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl -translate-y-6 md:-translate-y-0">
          <CardHeader className="rounded-t-xl">
            <StretchHorizontal className="mx-auto h-12 w-12 text-mv-orange mb-2" />
            <CardTitle className="text-center text-2xl">Add Products</CardTitle>
            <CardDescription className="text-center">Add products to your quote below.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-8 pb-6 pt-4">
            <div className="flex justify-end items-end gap-4 mb-4">
              <Button onClick={() => setIsOpenProductModalOpen(true)} className="text-sm h-[34px]">
                Add Product
              </Button>
            </div>

            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <Table className="hidden md:table table-fixed w-full">
                <TableHeader>
                  <TableRow className="bg-neutral-100">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-80">Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>VAT %</TableHead>
                    <TableHead>Total</TableHead>
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
                      <TableCell className="break-words truncate min-w-[120px]">{quoteProduct.name}</TableCell>
                      <TableCell>{quoteProduct.quantity}</TableCell>
                      <TableCell>{quoteProduct.vat_rate}</TableCell>
                      <TableCell className="font-bold">{`£ ${quoteProduct.total_value?.toFixed(2)}`}</TableCell>
                    </TableRow>
                  ))}

                  {quoteProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center align-middle">
                        No products added.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Mobile Table */}
              <Table className="table md:hidden table-fixed w-full">
                <TableHeader>
                  <TableRow className="bg-neutral-100">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-full">Product</TableHead>
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
                      <TableCell className="break-words truncate min-w-[120px]">{quoteProduct.name}</TableCell>
                      <TableCell className="font-bold">{`£ ${quoteProduct.total_value?.toFixed(2)}`}</TableCell>
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

            <div className="flex flex-col items-end mb-4">
              <div className="border-2 border-gray-200 rounded-xl mt-4 px-6 py-4 mb-4 w-[220px] flex flex-col items-end">
                <span className="text-gray-500 text-sm font-medium mb-1">Quote Total</span>
                <span className="text-2xl font-bold text-mv-orange">{`£ ${totalValue.toFixed(2)}`}</span>
              </div>

              {/* Error Message */}
              {mutation.isError && <FormError message={mutation.error.message} />}

              {/*  Buttons */}
              <div className="flexCol gap-2 w-[220px]">
                <Button onClick={onSubmit} size="lgFullWidth" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="text-white" /> : 'Add Products'}
                </Button>

                <LinkButton variant="ghost" size="lgFullWidth" to="/view-quotes">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </LinkButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuoteProductsTable;
