import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import ErrorCard from '@/lib/errorCard';
import { useState } from 'react';
import LoadingSpinner from '@/ui/LoadingSpinner';
import AddProductModal from './2a_addProductModal';
import CreateQuote from './1_createQuote';
import type { Product, QuoteProductInsert } from '@/types/dbTypes';
import QuoteProductsTable from './2b_quoteProductsTable';
import QuoteSummary from './3_quoteSummary';

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

        <QuoteProductsTable
          quoteProducts={quoteProducts}
          setQuoteProducts={setQuoteProducts}
          setIsOpenProductModalOpen={setIsOpenProductModalOpen}
          setStep={setStep}
        />
      </>
    );
  if (step === 3) return <QuoteSummary quoteId={quoteId} clientId={clientId} quoteProducts={quoteProducts} />;
};

export default AddQuote;
