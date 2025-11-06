import type { QuoteProductInsert, QuoteStatus } from '@/types/dbTypes';
import type { Steps } from '../components/stepIndicator';

export type QuoteData = {
  notes?: string;
  quoteStatus?: QuoteStatus;
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
    quoteStatus: 'quoted',
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
      return { ...state, quoteProducts: action.quoteProducts };
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
          notes: action.payload.notes || state.quoteData.notes,
          quoteStatus: action.payload.quoteStatus || state.quoteData.quoteStatus,
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
