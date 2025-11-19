import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import transactionSlice from './slices/transactionSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    transactions: transactionSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
