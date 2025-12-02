import type { Steps } from '../components/stepIndicator';
import { getQuoteTotalValue, getQuoteTotalVat } from '@/lib/quoteCalculator';
import type { Invoice, InvoiceProductInsert } from '@/types/dbTypes';

type EditInvoiceState = {
  clientId: number;
  invoiceProducts: InvoiceProductInsert[];
  selectedInvoiceProductIndex: number | null;
  editInvoiceData: Invoice;
  step: Steps;
  isAddProductModalOpen: boolean;
  isEditProductModalOpen: boolean;
};

export const editInvoiceInitialState: EditInvoiceState = {
  clientId: 0,
  invoiceProducts: [],
  selectedInvoiceProductIndex: null,
  editInvoiceData: {} as Invoice,
  step: 'ConfirmClient',
  isAddProductModalOpen: false,
  isEditProductModalOpen: false,
};

type SetClientIdAction = {
  type: 'SET_CLIENT_ID';
  clientId: number;
};

type SetInvoiceProductsAction = {
  type: 'SET_INVOICE_PRODUCTS';
  invoiceProducts: InvoiceProductInsert[];
};

type OpenEditProductModalAction = {
  type: 'OPEN_EDIT_PRODUCT_MODAL';
  index: number;
};

type CloseEditProductModalAction = {
  type: 'CLOSE_EDIT_PRODUCT_MODAL';
};

type SetSelectedInvoiceProductIndexAction = {
  type: 'SET_SELECTED_INVOICE_PRODUCT_INDEX';
  invoiceProductIndex: number | null;
};

type SetInvoiceDataAction = {
  type: 'SET_INVOICE_DATA';
  editInvoiceData: Invoice;
};

type SetNotesAction = {
  type: 'SET_NOTES';
  notes: string;
};

type SetStepAction = {
  type: 'SET_STEP';
  step: Steps;
};

type OpenAddProductModalAction = {
  type: 'OPEN_ADD_PRODUCT_MODAL';
};

type CloseAddProductModalAction = {
  type: 'CLOSE_ADD_PRODUCT_MODAL';
};

export type EditInvoiceAction =
  | SetClientIdAction
  | SetInvoiceProductsAction
  | SetSelectedInvoiceProductIndexAction
  | SetInvoiceDataAction
  | SetNotesAction
  | SetStepAction
  | OpenAddProductModalAction
  | CloseAddProductModalAction
  | OpenEditProductModalAction
  | CloseEditProductModalAction;

export const editInvoiceReducer = (state: EditInvoiceState, action: EditInvoiceAction): EditInvoiceState => {
  switch (action.type) {
    case 'SET_CLIENT_ID':
      return { ...state, clientId: action.clientId };

    case 'SET_INVOICE_PRODUCTS': {
      const productsForTotals = action.invoiceProducts as Parameters<typeof getQuoteTotalValue>[0];
      return {
        ...state,
        invoiceProducts: action.invoiceProducts,
        editInvoiceData: {
          ...state.editInvoiceData,
          total_value: getQuoteTotalValue(productsForTotals),
          total_vat: getQuoteTotalVat(productsForTotals),
        },
      };
    }

    case 'SET_SELECTED_INVOICE_PRODUCT_INDEX':
      return { ...state, selectedInvoiceProductIndex: action.invoiceProductIndex };

    case 'OPEN_EDIT_PRODUCT_MODAL':
      return {
        ...state,
        selectedInvoiceProductIndex: action.index,
        isEditProductModalOpen: true,
      };

    case 'CLOSE_EDIT_PRODUCT_MODAL':
      return {
        ...state,
        selectedInvoiceProductIndex: null,
        isEditProductModalOpen: false,
      };

    case 'SET_INVOICE_DATA':
      return {
        ...state,
        editInvoiceData: {
          ...state.editInvoiceData,
          ...action.editInvoiceData,
        },
      };

    case 'SET_NOTES':
      return { ...state, editInvoiceData: { ...state.editInvoiceData, notes: action.notes } };

    case 'SET_STEP':
      return { ...state, step: action.step };

    case 'OPEN_ADD_PRODUCT_MODAL':
      return { ...state, isAddProductModalOpen: true };

    case 'CLOSE_ADD_PRODUCT_MODAL':
      return { ...state, isAddProductModalOpen: false };

    default:
      return state;
  }
};
