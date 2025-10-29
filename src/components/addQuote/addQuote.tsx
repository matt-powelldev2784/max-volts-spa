import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import ErrorCard from '@/lib/errorCard';
import { useState } from 'react';
import LoadingSpinner from '@/ui/LoadingSpinner';
import AddProductModal from './components/addProductModal';
import AddClient from './components/addClient';
import type { QuoteProductInsert } from '@/types/dbTypes';
import AddProducts from './components/addProducts';
import QuoteSummary from './components/quoteSummary';
import StepIndicator, { type Steps } from './components/stepIndicator';
import EditProductModal from './components/editProductModal';

const getProducts = async () => {
  const { data, error } = await supabase.from('product').select('*').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const AddQuote = () => {
  const [clientId, setClientId] = useState(0);
  const [quoteProducts, setQuoteProducts] = useState<QuoteProductInsert[]>([]);
  const [selectedQuoteProductIndex, setSelectedQuoteProductIndex] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<Steps>('AddClient');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);

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
    <div className="md:bg-gray-50">
      <StepIndicator activeStep={step} />

      {step === 'AddClient' && <AddClient setStep={setStep} clientId={clientId} setClientId={setClientId} />}

      {step === 'AddProducts' && (
        <>
          <AddProducts
            quoteProducts={quoteProducts}
            setQuoteProducts={setQuoteProducts}
            setIsAddProductModalOpen={setIsAddProductModalOpen}
            setIsEditProductModalOpen={setIsEditProductModalOpen}
            setStep={setStep}
            setSelectedQuoteProductIndex={setSelectedQuoteProductIndex}
          />

          <AddProductModal
            isModalOpen={isAddProductModalOpen}
            setIsAddProductModalOpen={setIsAddProductModalOpen}
            setQuoteProducts={setQuoteProducts}
            products={productsData}
            quoteProducts={quoteProducts}
            setSelectedQuoteProductIndex={setSelectedQuoteProductIndex}
          />

          <EditProductModal
            isModalOpen={isEditProductModalOpen}
            setIsEditProductModalOpen={setIsEditProductModalOpen}
            setQuoteProducts={setQuoteProducts}
            products={productsData}
            quoteProducts={quoteProducts}
            selectedQuoteProductIndex={selectedQuoteProductIndex}
            setSelectedQuoteProductIndex={setSelectedQuoteProductIndex}
          />
        </>
      )}

      {step === 'QuoteSummary' && (
        <QuoteSummary
          clientId={clientId}
          quoteProducts={quoteProducts}
          setStep={setStep}
          notes={notes}
          setNotes={setNotes}
        />
      )}
    </div>
  );
};

export default AddQuote;
