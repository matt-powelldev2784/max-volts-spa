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
import StepIndicator, { type Steps } from './_stepIndicator';

const getProducts = async () => {
  const { data, error } = await supabase
    .from('product')
    .select('id, name, value, description')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Product[];
};

const AddQuote = () => {
  const [clientId, setClientId] = useState(0);
  const [step, setStep] = useState<Steps>('AddClient');
  const [quoteProducts, setQuoteProducts] = useState<QuoteProductInsert[]>([]);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  console.log('quoteProducts', quoteProducts);

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

  return (
    <div className="">
      <StepIndicator activeStep={step} />

      {step === 'AddClient' && <AddClient setStep={setStep} setClientId={setClientId} />}

      {step === 'AddProducts' && (
        <>
          <AddProductModal
            isModalOpen={isAddProductModalOpen}
            setIsAddProductModalOpen={setIsAddProductModalOpen}
            setQuoteProducts={setQuoteProducts}
            products={productsData}
          />

          <AddProducts
            quoteProducts={quoteProducts}
            setQuoteProducts={setQuoteProducts}
            setIsAddProductModalOpen={setIsAddProductModalOpen}
            setStep={setStep}
          />
        </>
      )}

      {step === 'QuoteSummary' && <QuoteSummary clientId={clientId} quoteProducts={quoteProducts} />}
    </div>
  );
};


export default AddQuote;
