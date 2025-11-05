import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import ErrorCard from '@/lib/errorCard';
import { useReducer } from 'react';
import LoadingSpinner from '@/ui/LoadingSpinner';
import AddProductModal from './components/addProductModal';
import AddClient from './components/addClient';
import AddProducts from './components/addProducts';
import QuoteSummary from './components/quoteSummary';
import StepIndicator from './components/stepIndicator';
import EditProductModal from './components/editProductModal';
import { addQuoteInitialState, addQuoteReducer } from './reducer/addQuoteReducer';

const getProducts = async () => {
  const { data, error } = await supabase.from('product').select('*').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const AddQuote = () => {
  const [state, dispatch] = useReducer(addQuoteReducer, addQuoteInitialState);
  const {
    clientId,
    quoteProducts,
    selectedQuoteProductIndex,
    notes,
    step,
    isAddProductModalOpen,
    isEditProductModalOpen,
  } = state;

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

      {step === 'AddClient' && <AddClient dispatch={dispatch} />}

      {step === 'AddProducts' && (
        <>
          <AddProducts quoteProducts={quoteProducts} dispatch={dispatch} />

          <AddProductModal
            isModalOpen={isAddProductModalOpen}
            dispatch={dispatch}
            products={productsData}
            quoteProducts={quoteProducts}
          />

          <EditProductModal
            isModalOpen={isEditProductModalOpen}
            products={productsData}
            quoteProducts={quoteProducts}
            selectedQuoteProductIndex={selectedQuoteProductIndex}
            dispatch={dispatch}
          />
        </>
      )}

      {step === 'QuoteSummary' && (
        <QuoteSummary clientId={clientId} quoteProducts={quoteProducts} notes={notes} dispatch={dispatch} />
      )}
    </div>
  );
};

export default AddQuote;
