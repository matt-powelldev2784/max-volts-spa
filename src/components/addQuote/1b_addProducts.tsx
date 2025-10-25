import { Button, LinkButton } from '@/ui/button';
import { ArrowLeft, Loader2, Trash, Pencil, EllipsisVertical } from 'lucide-react';
import { type Dispatch, type SetStateAction } from 'react';
import type { QuoteProductInsert } from '@/types/dbTypes';
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormError from '@/lib/formError';
import { Card, CardContent } from '@/ui/card';
import type { Steps } from './_stepIndicator';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/ui/dropdown-menu';

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

type AddProductProps = {
  quoteId: number;
  quoteProducts: QuoteProductInsert[];
  setQuoteProducts: Dispatch<SetStateAction<QuoteProductInsert[]>>;
  setIsOpenProductModalOpen: Dispatch<SetStateAction<boolean>>;
  setStep: Dispatch<SetStateAction<Steps>>;
};

export const AddProducts = ({
  quoteId,
  quoteProducts,
  setQuoteProducts,
  setIsOpenProductModalOpen,
  setStep,
}: AddProductProps) => {
  const queryClient = useQueryClient();

  const totalValue = quoteProducts.reduce((acc, curr) => acc + (curr.total_value || 0), 0);

  const mutation = useMutation({
    mutationFn: updateQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', 'quoteProducts'] });
      setStep('QuoteSummary');
    },
  });

  const onSubmit = () => {
    mutation.mutate({ quoteId, quoteProducts, totalValue });
  };

  const onRemove = (index: number) => {
    setQuoteProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const onEdit = () => {
    // TODO: Implement edit functionality
  };

  return (
    <div className="flex min-h-screen items-start justify-center md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[900px]">
        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl">
          <CardContent className="px-4 md:px-8 pb-6 pt-4">
            <div className="flex justify-end items-end gap-4 mb-4">
              <Button onClick={() => setIsOpenProductModalOpen(true)} className="text-sm h-[34px]">
                Add Product
              </Button>
            </div>

            {/* Product Cards */}
            <div className="flex flex-col gap-5 mb-8 w-full mx-auto">
              {quoteProducts.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">No products added.</div>
              )}
              {quoteProducts.map((quoteProduct, index) => (
                <div
                  key={`${quoteProduct.product_id}-${index}`}
                  className="relative flex items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm pl-2 pr-10 py-4 transition hover:shadow-md"
                >
                  {/* Three dots dropdown - left side, vertical */}
                  <div className="flex flex-col items-center mr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-full" aria-label="Product actions">
                          <EllipsisVertical className="h-6 w-6 md:h-8 md:w-8 text-mv-orange" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="p-1 min-w-[90px]">
                        <div className="flex flex-col">
                          <DropdownMenuItem className="flex items-center gap-3 px-2 py-1" onClick={() => onEdit()}>
                            <Pencil className="h-6 w-6 text-mv-orange" />
                            <span className="text-lg mr-2">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-3 px-2 py-1"
                            onClick={() => onRemove(index)}
                          >
                            <Trash className="h-6 w-6 text-mv-orange" />
                            <span className="text-lg mr-2">Remove</span>
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* Product Info and Price */}
                  <div className="flex flex-1 items-center min-w-0">
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-base text-gray-800 break-words">{quoteProduct.name}</div>
                        <div className="flex items-center min-w-[80px] justify-end ml-4">
                          <span className="text-base font-bold text-mv-orange">{`£ ${quoteProduct.total_value?.toFixed(2) ?? '-'}`}</span>
                        </div>
                      </div>
                      <div className="text-gray-500 text-xs mt-2 mb-0 italic line-clamp-2 max-w-[600px]">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                        the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley
                        of type and scrambled it to make a type specimen book. It has survived not only five centuries,
                        but also the leap into electronic typesetting, remaining essentially unchanged. It was
                        popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                        and more recently with desktop publishing software like Aldus PageMaker including versions of
                        Lorem Ipsum
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-end mb-4">
              <div className="border-2 border-gray-200 bg-gray-200 rounded-xl mt-4 px-6 py-4 mb-4 w-full md:w-[308px] flex flex-col items-end">
                <span className="text-black text-sm font-medium mb-1">Quote Total</span>
                <span className="text-2xl font-bold text-mv-orange">{`£ ${totalValue.toFixed(2)}`}</span>
              </div>

              {/* Error Message */}
              {mutation.isError && <FormError message={mutation.error.message} />}

              {/*  Buttons */}
              <div className="w-full flex flex-row justify-center md:justify-end gap-2 pt-4">
                <LinkButton variant="ghost" size="formButton" to="/view-quotes">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </LinkButton>

                <Button onClick={onSubmit} size="formButton" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="text-white" /> : 'Next Step'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProducts;
