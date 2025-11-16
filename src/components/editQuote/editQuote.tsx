import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import ErrorCard from '@/lib/errorCard';
import { useReducer, useEffect } from 'react';
import LoadingSpinner from '@/ui/LoadingSpinner';
import StepIndicator from '../addQuote/components/stepIndicator';
import AddClient from './components/addClient';
import EditQuoteSummary from './components/editQuoteSummary';
import { editQuoteInitialState, editQuoteReducer } from './reducer/editQuoteReducer';
import { useLocation } from 'react-router';
import AddProducts from './components/addProducts';
import AddProductModal from './components/addProductModal';
import EditProductModal from './components/editProductModal';

const getQuoteWithProducts = async (quoteId: number) => {
  const { data: quote, error: quoteError } = await supabase.from('quote').select('*').eq('id', quoteId).single();
  if (quoteError) throw new Error(quoteError.message);

  const { data: quoteProducts, error: productsError } = await supabase
    .from('quote_product')
    .select('*')
    .eq('quote_id', quoteId);
  if (productsError) throw new Error(productsError.message);

  return { quote, quoteProducts };
};

const getProducts = async () => {
  const { data, error } = await supabase.from('product').select('*').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const EditQuote = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const quoteId = Number(searchParams.get('quoteId'));

  const [state, dispatch] = useReducer(editQuoteReducer, editQuoteInitialState);
  const {
    clientId,
    quoteProducts,
    selectedQuoteProductIndex,
    editQuoteData,
    step,
    isAddProductModalOpen,
    isEditProductModalOpen,
  } = state;

  const {
    data: quoteData,
    isLoading: isLoadingQuote,
    isError: isQuoteError,
  } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => getQuoteWithProducts(quoteId),
  });

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const selectedClientId = clientId || quoteData?.quote.client_id || 0;

  // populate reducer state when quote data loads
  useEffect(() => {
    if (quoteData) {
      dispatch({ type: 'SET_CLIENT_ID', clientId: quoteData.quote.client_id });
      dispatch({ type: 'SET_QUOTE_PRODUCTS', quoteProducts: quoteData.quoteProducts });
      dispatch({ type: 'SET_QUOTE_DATA', editQuoteData: quoteData.quote });
      dispatch({ type: 'SET_STEP', step: 'AddClient' });
    }
  }, [quoteData]);

  if (isLoadingQuote || isLoadingProducts) return <LoadingSpinner />;
  if (isQuoteError || !quoteData) return <ErrorCard message={'Failed to load quote.'} />;
  if (isProductsError || !productsData) return <ErrorCard message={'Failed to load products.'} />;

  return (
    <section className="md:bg-gray-50">
      <StepIndicator activeStep={step} />

      {step === 'AddClient' && <AddClient clientId={selectedClientId} dispatch={dispatch} />}

      {step === 'AddProducts' && <AddProducts quoteProducts={quoteProducts} dispatch={dispatch} />}

      {step === 'QuoteSummary' && (
        <EditQuoteSummary quoteProducts={quoteProducts} quoteData={editQuoteData} dispatch={dispatch} />
      )}

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
    </section>
  );
};

export default EditQuote;
