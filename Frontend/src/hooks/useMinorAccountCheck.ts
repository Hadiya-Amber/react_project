import { useCustomer } from '@/context/CustomerContext';

export const useMinorAccountCheck = () => {
  const { data, loading } = useCustomer();

  if (!data || loading || !data.minorAccountCheck) {
    return {
      userAge: null,
      hasMinorAccounts: false,
      isMinorAccountBlocked: false,
      loading: loading
    };
  }

  return {
    userAge: data.minorAccountCheck.userAge,
    hasMinorAccounts: data.minorAccountCheck.hasMinorAccounts,
    isMinorAccountBlocked: data.minorAccountCheck.isMinorAccountBlocked,
    loading: false
  };
};
