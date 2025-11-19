import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionService } from '@/services/transactionService';

interface TransactionState {
  transactions: any[];
  pendingTransactions: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  pendingTransactions: [],
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await transactionService.getAllTransactions();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (transactionData: any, { rejectWithValue }) => {
    try {
      return await transactionService.transfer(transactionData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = transactionSlice.actions;
export default transactionSlice.reducer;
