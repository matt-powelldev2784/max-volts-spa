import type { QuoteProductInsert, QuoteStatus } from '@/types/dbTypes';
import type { Steps } from '../components/stepIndicator';
import { getQuoteTotalValue, getQuoteTotalVat } from '@/lib/quoteCalculator';

export type QuoteData = {
  notes: string;
  status: QuoteStatus;
  total_value: number;
  total_vat: number;
};

type addQuoteInitialStateType = {
  clientId: number;
  quoteProducts: QuoteProductInsert[];
  quoteData: QuoteData;
  selectedQuoteProductIndex: number | null;
  step: Steps;
  isAddProductModalOpen: boolean;
  isEditProductModalOpen: boolean;
};

const addQuoteInitialState: addQuoteInitialStateType = {
  clientId: 0,
  quoteProducts: [],
  quoteData: {
    notes: '',
    status: 'quoted',
    total_value: 0,
    total_vat: 0,
  },
  selectedQuoteProductIndex: null,
  step: 'AddClient',
  isAddProductModalOpen: false,
  isEditProductModalOpen: false,
};

type SetClientIdAction = {
  type: 'SET_CLIENT_ID';
  clientId: number;
};

type SetQuoteProductsAction = {
  type: 'SET_QUOTE_PRODUCTS';
  quoteProducts: QuoteProductInsert[];
};

type OpenEditProductModalAction = {
  type: 'OPEN_EDIT_PRODUCT_MODAL';
  index: number;
};

type CloseEditProductModalAction = {
  type: 'CLOSE_EDIT_PRODUCT_MODAL';
};

type SetQuoteData = {
  type: 'SET_QUOTE_DATA';
  payload: QuoteData;
};

type SetSelectedQuoteProductIndex = {
  type: 'SET_SELECTED_QUOTE_PRODUCT_INDEX';
  index: number | null;
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

export type AddQuoteAction =
  | SetClientIdAction
  | SetQuoteProductsAction
  | OpenEditProductModalAction
  | CloseEditProductModalAction
  | SetQuoteData
  | SetSelectedQuoteProductIndex
  | SetStepAction
  | OpenAddProductModalAction
  | CloseAddProductModalAction;

const addQuoteReducer = (state: addQuoteInitialStateType, action: AddQuoteAction) => {
  switch (action.type) {
    case 'SET_CLIENT_ID':
      return { ...state, clientId: action.clientId };
    case 'SET_QUOTE_PRODUCTS':
      return {
        ...state,
        quoteProducts: action.quoteProducts,
        quoteData: {
          ...state.quoteData,
          total_value: getQuoteTotalValue(action.quoteProducts),
          total_vat: getQuoteTotalVat(action.quoteProducts),
        },
      };
    case 'OPEN_EDIT_PRODUCT_MODAL':
      return {
        ...state,
        selectedQuoteProductIndex: action.index,
        isEditProductModalOpen: true,
      };
    case 'CLOSE_EDIT_PRODUCT_MODAL':
      return {
        ...state,
        selectedQuoteProductIndex: null,
        isEditProductModalOpen: false,
      };
    case 'SET_QUOTE_DATA':
      return {
        ...state,
        quoteData: {
          ...state.quoteData,
          notes: action.payload.notes || state.quoteData.notes,
          status: action.payload.status || state.quoteData.status,
        },
      };
    case 'SET_SELECTED_QUOTE_PRODUCT_INDEX':
      return { ...state, selectedQuoteProductIndex: action.index };
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

export { addQuoteInitialState, addQuoteReducer };
