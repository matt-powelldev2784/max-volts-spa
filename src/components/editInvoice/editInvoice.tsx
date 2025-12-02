import { useLocation } from 'react-router';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/ui/LoadingSpinner';
import ErrorCard from '@/lib/errorCard';
import { editInvoiceInitialState, editInvoiceReducer } from './reducer/editInvoiceReducer';
import { useEffect, useReducer } from 'react';
import StepIndicator from './components/stepIndicator';
import ConfirmClient from './components/confirmClient';
import EditProducts from './components/editProducts';
import AddProductModal from './components/addProductModal';
import EditProductModal from './components/editProductModal';
import EditInvoiceSummary from './components/editInvoiceSummary';

const getInvoiceWithProducts = async (invoiceId: number) => {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoice')
    .select('*')
    .eq('id', invoiceId)
    .single();
  if (invoiceError) throw new Error(invoiceError.message);

  const { data: invoiceProducts, error: productsError } = await supabase
    .from('invoice_product')
    .select('*')
    .eq('invoice_id', invoiceId);
  if (productsError) throw new Error(productsError.message);

  return { invoice, invoiceProducts };
};

const getProducts = async () => {
  const { data, error } = await supabase.from('product').select('*').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const EditInvoice = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const invoiceId = Number(searchParams.get('invoiceId'));

  const [state, dispatch] = useReducer(editInvoiceReducer, editInvoiceInitialState);
  const {
    clientId,
    invoiceProducts,
    selectedInvoiceProductIndex,
    editInvoiceData,
    step,
    isAddProductModalOpen,
    isEditProductModalOpen,
  } = state;

  console.log('clientId', clientId);

  const {
    data: invoiceData,
    isLoading: isLoadingInvoice,
    isError: isInvoiceError,
  } = useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: () => getInvoiceWithProducts(invoiceId),
  });

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // populate reducer state when quote data loads
  useEffect(() => {
    if (invoiceData) {
      dispatch({ type: 'SET_CLIENT_ID', clientId: invoiceData.invoice.client_id });
      dispatch({ type: 'SET_INVOICE_PRODUCTS', invoiceProducts: invoiceData.invoiceProducts });
      dispatch({ type: 'SET_INVOICE_DATA', editInvoiceData: invoiceData.invoice });
      dispatch({ type: 'SET_STEP', step: 'ConfirmClient' });
    }
  }, [invoiceData]);

  if (isLoadingInvoice || isLoadingProducts) return <LoadingSpinner />;
  if (isInvoiceError || !invoiceData) return <ErrorCard message={'Failed to load quote.'} />;
  if (isProductsError || !productsData) return <ErrorCard message={'Failed to load products.'} />;

  return (
    <section className="md:bg-gray-50">
      <StepIndicator activeStep={step} />

      {step === 'ConfirmClient' && <ConfirmClient clientId={clientId} dispatch={dispatch} />}

      {step === 'EditProducts' && <EditProducts invoiceProducts={invoiceProducts} dispatch={dispatch} />}

      {step === 'InvoiceSummary' && (
        <EditInvoiceSummary
          invoiceProducts={invoiceProducts}
          invoiceData={editInvoiceData}
          clientId={clientId}
          dispatch={dispatch}
        />
      )}

      <AddProductModal
        isModalOpen={isAddProductModalOpen}
        dispatch={dispatch}
        products={productsData}
        invoiceProducts={invoiceProducts}
      />

      <EditProductModal
        isModalOpen={isEditProductModalOpen}
        products={productsData}
        invoiceProducts={invoiceProducts}
        selectedInvoiceProductIndex={selectedInvoiceProductIndex}
        dispatch={dispatch}
      />
    </section>
  );
};

export default EditInvoice;
