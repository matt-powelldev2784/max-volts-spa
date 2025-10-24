import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import ErrorCard from '@/lib/errorCard';
import { useState } from 'react';
import LoadingSpinner from '@/ui/LoadingSpinner';
import AddProductModal from './1a_addProductModal';
import AddClient from './0_addClient';
import type { Product, QuoteProductInsert } from '@/types/dbTypes';
import AddProducts from './1b_addProducts';
import QuoteSummary from './2_quoteSummary';

const getProducts = async () => {
  const { data, error } = await supabase.from('product').select('id, name, value').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Product[];
};

export type Steps = 'AddClient' | 'AddProducts' | 'QuoteSummary';

const AddQuote = () => {
  const [quoteId, setQuoteId] = useState(0);
  const [clientId, setClientId] = useState(0);
  const [step, setStep] = useState<Steps>('AddClient');
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

  if (step === 'AddClient') return <AddClient setStep={setStep} setQuoteId={setQuoteId} setClientId={setClientId} />;
  if (step === 'AddProducts')
    return (
      <>
        <AddProductModal
          isModalOpen={isAddProductModalOpen}
          setIsOpenProductModalOpen={setIsOpenProductModalOpen}
          setQuoteProducts={setQuoteProducts}
          products={productsData}
          quoteId={quoteId}
        />

        <AddProducts
          quoteId={quoteId}
          quoteProducts={quoteProducts}
          setQuoteProducts={setQuoteProducts}
          setIsOpenProductModalOpen={setIsOpenProductModalOpen}
          setStep={setStep}
        />
      </>
    );
  if (step === 'QuoteSummary') return <QuoteSummary quoteId={quoteId} clientId={clientId} />;
};

export default AddQuote;
