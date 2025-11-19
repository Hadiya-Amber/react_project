import { useCallback, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';

// useCallback for memoized functions
export const useOptimizedCallback = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const handleTransaction = useCallback((data: any) => {
    // Memoized function to prevent re-renders
    dispatch({ type: 'transactions/create', payload: data });
  }, [dispatch]);

  return { handleTransaction };
};

// useMemo for expensive calculations
export const useTransactionAnalytics = () => {
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  
  const analytics = useMemo(() => {
    return {
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      avgAmount: transactions.length ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  return analytics;
};

// useRef for DOM manipulation
export const useFocusInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return { inputRef, focusInput };
};

// Custom hook with useImperativeHandle
export interface FormHandle {
  reset: () => void;
  submit: () => void;
}

export const useFormHandle = () => {
  const formRef = useRef<FormHandle>(null);
  
  const resetForm = () => formRef.current?.reset();
  const submitForm = () => formRef.current?.submit();

  return { formRef, resetForm, submitForm };
};
