import React, { createContext, useContext, ReactNode } from 'react';
import { useBackendData } from '@/hooks/useBackendData';
import { EnumOption, BranchOption, SystemConfiguration, ValidationRules } from '@/services/dataService';

interface BackendDataContextType {
  // Data
  userRoles: EnumOption[];
  userStatuses: EnumOption[];
  genders: EnumOption[];
  accountTypes: EnumOption[];
  accountStatuses: EnumOption[];
  transactionTypes: EnumOption[];
  transactionStatuses: EnumOption[];
  branches: BranchOption[];
  activeBranches: BranchOption[];
  systemConfig: SystemConfiguration | null;
  validationRules: ValidationRules | null;
  countries: EnumOption[];
  states: EnumOption[];
  occupationTypes: EnumOption[];
  idProofTypes: EnumOption[];
  incomeRanges: EnumOption[];
  
  // State
  isLoading: boolean;
  hasErrors: boolean;
  
  // Functions
  refreshBranches: () => void;
  refreshConfiguration: () => void;
  clearCacheAndReload: () => void;
  getBranchById: (id: number) => BranchOption | undefined;
  getBranchByCode: (code: string) => BranchOption | undefined;
  getEnumLabel: (options: EnumOption[], value: number) => string;
  
  // Helper functions for common enum lookups
  getUserRoleLabel: (value: number) => string;
  getUserStatusLabel: (value: number) => string;
  getGenderLabel: (value: number) => string;
  getAccountTypeLabel: (value: number) => string;
  getAccountStatusLabel: (value: number) => string;
  getTransactionTypeLabel: (value: number) => string;
  getTransactionStatusLabel: (value: number) => string;
}

const BackendDataContext = createContext<BackendDataContextType | undefined>(undefined);

interface BackendDataProviderProps {
  children: ReactNode;
}

export const BackendDataProvider: React.FC<BackendDataProviderProps> = ({ children }) => {
  const {
    data,
    isLoading,
    hasErrors,
    refreshBranches,
    refreshConfiguration,
    clearCacheAndReload,
    getBranchById,
    getBranchByCode,
    getEnumLabel
  } = useBackendData();

  // Helper functions for common enum lookups
  const getUserRoleLabel = (value: number) => getEnumLabel(data.userRoles, value);
  const getUserStatusLabel = (value: number) => getEnumLabel(data.userStatuses, value);
  const getGenderLabel = (value: number) => getEnumLabel(data.genders, value);
  const getAccountTypeLabel = (value: number) => getEnumLabel(data.accountTypes, value);
  const getAccountStatusLabel = (value: number) => getEnumLabel(data.accountStatuses, value);
  const getTransactionTypeLabel = (value: number) => getEnumLabel(data.transactionTypes, value);
  const getTransactionStatusLabel = (value: number) => getEnumLabel(data.transactionStatuses, value);

  const contextValue: BackendDataContextType = {
    // Data
    userRoles: data.userRoles,
    userStatuses: data.userStatuses,
    genders: data.genders,
    accountTypes: data.accountTypes,
    accountStatuses: data.accountStatuses,
    transactionTypes: data.transactionTypes,
    transactionStatuses: data.transactionStatuses,
    branches: data.branches,
    activeBranches: data.activeBranches,
    systemConfig: data.systemConfig,
    validationRules: data.validationRules,
    countries: data.countries,
    states: data.states,
    occupationTypes: data.occupationTypes,
    idProofTypes: data.idProofTypes,
    incomeRanges: data.incomeRanges,
    
    // State
    isLoading,
    hasErrors,
    
    // Functions
    refreshBranches,
    refreshConfiguration,
    clearCacheAndReload,
    getBranchById,
    getBranchByCode,
    getEnumLabel,
    
    // Helper functions
    getUserRoleLabel,
    getUserStatusLabel,
    getGenderLabel,
    getAccountTypeLabel,
    getAccountStatusLabel,
    getTransactionTypeLabel,
    getTransactionStatusLabel
  };

  return (
    <BackendDataContext.Provider value={contextValue}>
      {children}
    </BackendDataContext.Provider>
  );
};

export const useBackendDataContext = (): BackendDataContextType => {
  const context = useContext(BackendDataContext);
  if (context === undefined) {
    throw new Error('useBackendDataContext must be used within a BackendDataProvider');
  }
  return context;
};

export default BackendDataContext;
