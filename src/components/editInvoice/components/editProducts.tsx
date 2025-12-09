import { type Dispatch } from 'react';
import { Button } from '@/ui/button';
import { EllipsisVertical } from 'lucide-react';
import { Card, CardContent } from '@/ui/card';
import type { InvoiceProductForEditInvoice } from '@/types/dbTypes';
import type { EditInvoiceAction } from '../reducer/editInvoiceReducer';
import { InvoiceProductCard } from './invoiceProductCard';

type EditProductsProps = {
  invoiceProducts: InvoiceProductForEditInvoice[];
  dispatch: Dispatch<EditInvoiceAction>;
};

const EditProducts = ({ invoiceProducts, dispatch }: EditProductsProps) => {
  const totalValue = invoiceProducts.reduce((acc, curr) => acc + (curr.total_value || 0), 0);
  const totalVat = invoiceProducts.reduce((acc, curr) => acc + (curr.total_vat || 0), 0);

  const handleNext = () => {
    dispatch({ type: 'SET_STEP', step: 'InvoiceSummary' });
  };

  const handleGoBack = () => {
    dispatch({ type: 'SET_STEP', step: 'ConfirmClient' });
  };

  const handleAddProduct = () => {
    dispatch({ type: 'OPEN_ADD_PRODUCT_MODAL' });
  };

  const handleRemoveProduct = (index: number) => {
    dispatch({
      type: 'SET_INVOICE_PRODUCTS',
      invoiceProducts: invoiceProducts.filter((_, i) => i !== index),
    });
  };

  const handleEditProduct = (index: number) => {
    dispatch({ type: 'OPEN_EDIT_PRODUCT_MODAL', index });
  };

  return (
    <section className="flex min-h-screen items-start justify-center md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[900px]">
        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl">
          <CardContent className="px-4 md:px-8 pb-6 pt-4">
            {/* Add Product Button */}
            <div className="flex justify-end items-end gap-4 mb-4">
              <Button onClick={handleAddProduct} className="text-sm h-[34px]">
                Add Product
              </Button>
            </div>

            {/* Products List */}
            <div className="flex flex-col gap-5 mb-8 w-full mx-auto">
              {invoiceProducts.length === 0 && (
                <article className="relative flex flex-row items-center justify-between gap-2 bg-white border-2 border-gray-200 rounded-xl px-2 py-4">
                  <EllipsisVertical className="h-6 w-6 md:h-8 md:w-8 text-gray-500" />
                  <div className="absolute w-full -translate-x-2">
                    <p className="text-gray-500 text-center">No products added.</p>
                    <p className="text-gray-500 text-center hidden md:block">
                      Click the Add Product button to add items to the invoice
                    </p>
                  </div>
                </article>
              )}

              {invoiceProducts.map((product, index) => (
                <InvoiceProductCard
                  key={`${product.product_id}-${index}`}
                  product={product}
                  onEditProduct={() => handleEditProduct(index)}
                  onRemoveProduct={() => handleRemoveProduct(index)}
                />
              ))}
            </div>

            {/* Invoice Totals */}
            <div className="flex flex-col items-end mb-4">
              <div className="flex flex-col items-end w-full">
                <div className="bg-mv-orange/10 rounded-xl mt-4 px-6 py-4 mb-4 w-full md:w-[308px] flex flex-col items-end gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-black text-sm font-medium">VAT Total</span>
                    <span className="text-2xl font-bold text-mv-orange">{`£ ${totalVat.toFixed(2)}`}</span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-black text-sm font-medium">Invoice Total</span>
                    <span className="text-2xl font-bold text-mv-orange">{`£ ${totalValue.toFixed(2)}`}</span>
                  </div>
                </div>
              </div>

              <div className="relative w-full flex flex-row justify-end gap-2 px-1 md:px-0 pt-4">
                <Button variant="ghost" size="formButton" onClick={handleGoBack}>
                  Go Back
                </Button>

                <Button onClick={handleNext} size="formButton" disabled={invoiceProducts.length === 0}>
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

export default EditProducts;
