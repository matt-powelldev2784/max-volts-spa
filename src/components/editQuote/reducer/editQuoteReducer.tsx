import type { Steps } from '@/components/addQuote/components/stepIndicator';
import type { Quote, QuoteProductInsert } from '@/types/dbTypes';

type EditQuoteInitialStateType = {
  clientId: number;
  quoteProducts: QuoteProductInsert[];
  selectedQuoteProductIndex: number | null;
  editQuoteData: Quote;
  step: Steps;
  isAddProductModalOpen: boolean;
  isEditProductModalOpen: boolean;
};

const getTotalValue = (quoteProducts: QuoteProductInsert[]) => {
  return quoteProducts.reduce((acc, curr) => acc + (curr.total_value || 0), 0);
};

const getTotalVat = (quoteProducts: QuoteProductInsert[]) => {
  return quoteProducts.reduce((acc, curr) => acc + (curr.total_vat || 0), 0);
};

const editQuoteInitialState: EditQuoteInitialStateType = {
  clientId: 0,
  quoteProducts: [],
  selectedQuoteProductIndex: null,
  editQuoteData: {} as Quote,
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

type SetSelectedQuoteProductIndexAction = {
  type: 'SET_SELECTED_QUOTE_PRODUCT_INDEX';
  quoteProductIndex: number | null;
};

type SetQuoteData = {
  type: 'SET_QUOTE_DATA';
  editQuoteData: Quote;
};

type SetStepAction = {
  type: 'SET_STEP';
  step: Steps;
};

type SetNotesAction = {
  type: 'SET_NOTES';
  notes: string;
};

type OpenAddProductModalAction = {
  type: 'OPEN_ADD_PRODUCT_MODAL';
};

type CloseAddProductModal = {
  type: 'CLOSE_ADD_PRODUCT_MODAL';
};

export type EditQuoteAction =
  | SetClientIdAction
  | SetQuoteProductsAction
  | OpenEditProductModalAction
  | CloseEditProductModalAction
  | SetSelectedQuoteProductIndexAction
  | SetQuoteData
  | SetNotesAction
  | SetStepAction
  | OpenAddProductModalAction
  | CloseAddProductModal;

const editQuoteReducer = (state: EditQuoteInitialStateType, action: EditQuoteAction) => {
  switch (action.type) {
    case 'SET_CLIENT_ID':
      return { ...state, clientId: action.clientId };
    case 'SET_QUOTE_PRODUCTS':
      return {
        ...state,
        quoteProducts: action.quoteProducts,
        editQuoteData: {
          ...state.editQuoteData,
          total_value: getTotalValue(action.quoteProducts),
          total_vat: getTotalVat(action.quoteProducts),
        },
      };
    case 'SET_SELECTED_QUOTE_PRODUCT_INDEX':
      return { ...state, selectedQuoteProductIndex: action.quoteProductIndex };
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
        editQuoteData: {
          ...state.editQuoteData,
          ...action.editQuoteData,
        },
      };
    case 'SET_NOTES':
      return { ...state, editQuoteData: { ...state.editQuoteData, notes: action.notes } };
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

export { editQuoteInitialState, editQuoteReducer };
