import type { Steps } from '@/components/addQuote/components/stepIndicator';
import type { QuoteProductUpdate } from '@/types/dbTypes';

type EditQuoteInitialStateType = {
  clientId: number;
  quoteProducts: QuoteProductUpdate[];
  selectedQuoteProductIndex: number | null;
  notes: string;
  step: Steps;
  isAddProductModalOpen: boolean;
  isEditProductModalOpen: boolean;
};

const editQuoteInitialState: EditQuoteInitialStateType = {
  clientId: 0,
  quoteProducts: [],
  selectedQuoteProductIndex: null,
  notes: '',
  step: 'AddClient',
  isAddProductModalOpen: false,
  isEditProductModalOpen: false,
};

type SetClientIdAction = {
  type: 'SET_CLIENT_ID';
  payload: number;
};

type SetQuoteProductsAction = {
  type: 'SET_QUOTE_PRODUCTS';
  payload: QuoteProductUpdate[];
};

type OpenEditProductModalAction = {
  type: 'OPEN_EDIT_PRODUCT_MODAL';
  payload: { index: number; isOpen: boolean };
};

type CloseEditProductModalAction = {
  type: 'CLOSE_EDIT_PRODUCT_MODAL';
  payload: { isOpen: boolean; selectedQuoteProductIndex: null };
};

type SetSelectedQuoteProductIndexAction = {
  type: 'SET_SELECTED_QUOTE_PRODUCT_INDEX';
  payload: number | null;
};

type SetNotesAction = {
  type: 'SET_NOTES';
  payload: string;
};

type SetStepAction = {
  type: 'SET_STEP';
  payload: Steps;
};

type SetIsAddProductModalOpenAction = {
  type: 'SET_IS_ADD_PRODUCT_MODAL_OPEN';
  payload: boolean;
};

type SetIsEditProductModalOpenAction = {
  type: 'SET_IS_EDIT_PRODUCT_MODAL_OPEN';
  payload: boolean;
};

export type EditQuoteAction =
  | SetClientIdAction
  | SetQuoteProductsAction
  | OpenEditProductModalAction
  | CloseEditProductModalAction
  | SetSelectedQuoteProductIndexAction
  | SetNotesAction
  | SetStepAction
  | SetIsAddProductModalOpenAction
  | SetIsEditProductModalOpenAction;

const editQuoteReducer = (state: EditQuoteInitialStateType, action: EditQuoteAction) => {
  switch (action.type) {
    case 'SET_CLIENT_ID':
      return { ...state, clientId: action.payload };
    case 'SET_QUOTE_PRODUCTS':
      return { ...state, quoteProducts: action.payload };
    case 'SET_SELECTED_QUOTE_PRODUCT_INDEX':
      return { ...state, selectedQuoteProductIndex: action.payload };
    case 'OPEN_EDIT_PRODUCT_MODAL':
      return {
        ...state,
        selectedQuoteProductIndex: action.payload.index,
        isEditProductModalOpen: action.payload.isOpen,
      };
    case 'CLOSE_EDIT_PRODUCT_MODAL':
      return {
        ...state,
        selectedQuoteProductIndex: null,
        isEditProductModalOpen: false,
      };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_IS_ADD_PRODUCT_MODAL_OPEN':
      return { ...state, isAddProductModalOpen: action.payload };
    case 'SET_IS_EDIT_PRODUCT_MODAL_OPEN':
      return { ...state, isEditProductModalOpen: action.payload };
    default:
      return state;
  }
};

export { editQuoteInitialState, editQuoteReducer };
