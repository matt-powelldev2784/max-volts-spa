import { Button, LinkButton } from '@/ui/button';
import { ArrowLeft, Trash } from 'lucide-react';
import { type Dispatch, type SetStateAction } from 'react';
import { TableCell, TableHead, TableHeader, TableRow, TableBody, Table } from '@/ui/table';
import type { QuoteProductInsert } from '@/types/dbTypes';

type QuoteProductsTableProps = {
  quoteProducts: QuoteProductInsert[];
  setQuoteProducts: Dispatch<SetStateAction<QuoteProductInsert[]>>;
  setIsOpenProductModalOpen: Dispatch<SetStateAction<boolean>>;
};

export const QuoteProductsTable = ({
  quoteProducts,
  setQuoteProducts,
  setIsOpenProductModalOpen,
}: QuoteProductsTableProps) => {
  const totalValue = quoteProducts.reduce((acc, curr) => {
    return acc + (curr.total_value || 0);
  }, 0);

  const onRemove = (index: number) => {
    setQuoteProducts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-11/12 mx-auto mt-4">
      <div className="overflow-x-auto">
        <div className="flexRow gap-4 mt-4 mb-6 md:bg-transparent w-full">
          <LinkButton variant="iconGhost" size="sm" to="/view-quotes">
            <ArrowLeft className="h-6 w-6" />
          </LinkButton>
          <h1 className="text-3xl font-bold text-gray-800">Add Products</h1>
        </div>

        <div className="flex justify-between items-end gap-4 mb-4 mx-2">
          <p className="text-2xl text-gray-800">Quote Products</p>
          <Button onClick={() => setIsOpenProductModalOpen(true)} className="text-sm h-[34px]">
            Add Product
          </Button>
        </div>

        {/* Desktop Table */}
        <Table className="hidden md:table table-fixed">
          <TableHeader>
            <TableRow className="bg-neutral-100">
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-80">Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit value</TableHead>
              <TableHead>Markup</TableHead>
              <TableHead>VAT</TableHead>
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

                <TableCell>{quoteProduct.name}</TableCell>
                <TableCell>{quoteProduct.quantity}</TableCell>
                <TableCell>£{quoteProduct.value?.toFixed(2)}</TableCell>
                <TableCell>{quoteProduct.markup}%</TableCell>
                <TableCell>{quoteProduct.vat_rate}%</TableCell>
                <TableCell className="font-bold">{`£ ${quoteProduct.total_value?.toFixed(2)}`}</TableCell>
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

        <div className="flex flex-col items-end">
          <div className="border-2 border-gray-200 rounded-xl mt-4 px-6 py-4 w-[220px] flex flex-col items-end">
            <span className="text-gray-500 text-sm font-medium mb-1">Quote Total</span>
            <span className="text-2xl font-bold text-mv-orange">{`£ ${totalValue.toFixed(2)}`}</span>
          </div>

          <Button size="lg" variant="default" className="mt-6 w-[220px]" disabled={quoteProducts.length === 0}>
            Proceed to Quote Summary
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuoteProductsTable;
