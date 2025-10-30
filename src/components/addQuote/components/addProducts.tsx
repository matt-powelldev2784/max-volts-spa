import { Button } from '@/ui/button';
import { Trash, Pencil, EllipsisVertical } from 'lucide-react';
import { type Dispatch } from 'react';
import type { QuoteProductInsert } from '@/types/dbTypes';
import { Card, CardContent } from '@/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/ui/dropdown-menu';
import type { AddQuoteAction } from '../reducer/addQuoteReducer';

type AddProductProps = {
  quoteProducts: QuoteProductInsert[];
  dispatch: Dispatch<AddQuoteAction>;
};

export const AddProducts = ({ quoteProducts, dispatch }: AddProductProps) => {
  const totalValue = quoteProducts.reduce((acc, curr) => acc + curr.total_value, 0);

  const onSubmit = () => {
    dispatch({ type: 'SET_STEP', payload: 'QuoteSummary' });
  };

  const onRemoveProduct = (index: number) => {
    dispatch({ type: 'SET_QUOTE_PRODUCTS', payload: quoteProducts.filter((_, i) => i !== index) });
  };

  const onAddProduct = () => {
    dispatch({ type: 'SET_IS_ADD_PRODUCT_MODAL_OPEN', payload: true });
  };

  const onEditProduct = (index: number) => {
    dispatch({ type: 'OPEN_EDIT_PRODUCT_MODAL', payload: { index, isOpen: true } });
  };

  const goToPreviousStep = () => {
    dispatch({ type: 'SET_STEP', payload: 'AddClient' });
  };

  return (
    <section className="flex min-h-screen items-start justify-center md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[900px]">
        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl">
          <CardContent className="px-4 md:px-8 pb-6 pt-4">
            {/* Add Product Button */}
            <div className="flex justify-end items-end gap-4 mb-4">
              <Button onClick={onAddProduct} className="text-sm h-[34px]">
                Add Product
              </Button>
            </div>

            {/* Products List */}
            <div className="flex flex-col gap-5 mb-8 w-full mx-auto">
              {quoteProducts.length === 0 && (
                <article className="relative flex flex-row items-center justify-between gap-2 bg-white border-2 border-gray-200 rounded-xl px-2 py-4">
                  <EllipsisVertical className="h-6 w-6 md:h-8 md:w-8 text-gray-500" />
                  <div className="absolute w-full -translate-x-2">
                    <p className="text-gray-500 text-center">No products added.</p>
                    <p className="text-gray-500 text-center hidden md:block">
                      Click the Add Product button to add items to the quote
                    </p>
                  </div>
                </article>
              )}

              {quoteProducts.map((product, index) => (
                <AddProductCard
                  key={`${product.product_id}-${index}`}
                  product={product}
                  onEditProduct={() => onEditProduct(index)}
                  onRemoveProduct={() => onRemoveProduct(index)}
                />
              ))}
            </div>

            {/* Quote Total */}
            <div className="flex flex-col items-end mb-4">
              <div className="bg-mv-orange/10 rounded-xl mt-4 px-6 py-4 mb-4 w-full md:w-[308px] flex flex-col items-end">
                <span className="text-black text-sm font-medium mb-1">Quote Total</span>
                <span className="text-2xl font-bold text-mv-orange">{`£ ${totalValue.toFixed(2)}`}</span>
              </div>

              {/* Buttons */}
              <div className="relative w-full flex flex-row justify-end gap-2 px-1 md:px-0 pt-4">
                <Button variant="ghost" size="formButton" onClick={goToPreviousStep}>
                  Go Back
                </Button>

                <Button onClick={onSubmit} size="formButton" disabled={quoteProducts.length === 0}>
                  Next Step
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AddProducts;

type AddProductCardProps = {
  product: QuoteProductInsert;
  onEditProduct: () => void;
  onRemoveProduct: () => void;
};
export const AddProductCard = ({ product, onEditProduct, onRemoveProduct }: AddProductCardProps) => (
  <article className="relative flex items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm pl-2 pr-4 md:pr-10 py-4 transition hover:shadow-md">
    <div className="flex flex-col items-center mr-2 md:mr-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full" aria-label="Product actions">
            <EllipsisVertical className="h-6 w-6 md:h-8 md:w-8 text-mv-orange" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="start" className="p-1 min-w-[90px]">
          <div className="flex flex-col">
            <DropdownMenuItem className="flex items-center gap-3 px-2 py-1" onClick={onEditProduct}>
              <Pencil className="h-6 w-6 text-mv-orange" />
              <p className="text-lg mr-2">Edit</p>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-3 px-2 py-1" onClick={onRemoveProduct}>
              <Trash className="h-6 w-6 text-mv-orange" />
              <p className="text-lg mr-2">Remove</p>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div className="flex flex-1 items-center">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base text-gray-800 line-clamp-1 flex-3">{product.name}</span>

          <span className="text-base font-bold text-mv-orange min-w-[80px] ml-2 md:ml-4 flex justify-end flex-1">
            £ {product.total_value?.toFixed(2)}
          </span>
        </div>

        <span className="text-gray-500 text-sm italic line-clamp-2 max-w-[600px] hidden md:block">
          {product.description}
        </span>
      </div>
    </div>
  </article>
);

