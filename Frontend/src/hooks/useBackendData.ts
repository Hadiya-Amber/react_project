import { useState, useEffect, useCallback } from 'react';
import { dataService, EnumOption, BranchOption, SystemConfiguration, ValidationRules } from '@/services/dataService';

interface BackendDataState {
  // Enum Options
  userRoles: EnumOption[];
  userStatuses: EnumOption[];
  genders: EnumOption[];
  accountTypes: EnumOption[];
  accountStatuses: EnumOption[];
  transactionTypes: EnumOption[];
  transactionStatuses: EnumOption[];
  
  // Dynamic Data
  branches: BranchOption[];
  activeBranches: BranchOption[];
  
  // Configuration
  systemConfig: SystemConfiguration | null;
  validationRules: ValidationRules | null;
  
  // Static Lists
  countries: EnumOption[];
  states: EnumOption[];
  occupationTypes: EnumOption[];
  idProofTypes: EnumOption[];
  incomeRanges: EnumOption[];
  
  // Loading States
  loading: {
    enums: boolean;
    branches: boolean;
    config: boolean;
    staticData: boolean;
  };
  
  // Error States
  errors: {
    enums: string | null;
    branches: string | null;
    config: string | null;
    staticData: string | null;
  };
}

const initialState: BackendDataState = {
  userRoles: [],
  userStatuses: [],
  genders: [],
  accountTypes: [],
  accountStatuses: [],
  transactionTypes: [],
  transactionStatuses: [],
  branches: [],
  activeBranches: [],
  systemConfig: null,
  validationRules: null,
  countries: [],
  states: [],
  occupationTypes: [],
  idProofTypes: [],
  incomeRanges: [],
  loading: {
    enums: false,
    branches: false,
    config: false,
    staticData: false
  },
  errors: {
    enums: null,
    branches: null,
    config: null,
    staticData: null
  }
};

export const useBackendData = () => {
  const [data, setData] = useState<BackendDataState>(initialState);

  // Load enum options
  const loadEnumOptions = useCallback(async () => {
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, enums: true },
      errors: { ...prev.errors, enums: null }
    }));

    try {
      const [
        userRoles,
        userStatuses,
        genders,
        accountTypes,
        accountStatuses,
        transactionTypes,
        transactionStatuses
      ] = await Promise.all([
        dataService.getUserRoleOptions(),
        dataService.getUserStatusOptions(),
        dataService.getGenderOptions(),
        dataService.getAccountTypeOptions(),
        dataService.getAccountStatusOptions(),
        dataService.getTransactionTypeOptions(),
        dataService.getTransactionStatusOptions()
      ]);

      setData(prev => ({
        ...prev,
        userRoles,
        userStatuses,
        genders,
        accountTypes,
        accountStatuses,
        transactionTypes,
        transactionStatuses,
        loading: { ...prev.loading, enums: false }
      }));
    } catch (error: any) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, enums: false },
        errors: { ...prev.errors, enums: error.message || 'Failed to load enum options' }
      }));
    }
  }, []);

  // Load branches
  const loadBranches = useCallback(async () => {
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, branches: true },
      errors: { ...prev.errors, branches: null }
    }));

    try {
      const [allBranches, activeBranches] = await Promise.all([
        dataService.getAllBranches(),
        dataService.getActiveBranches()
      ]);

      setData(prev => ({
        ...prev,
        branches: allBranches,
        activeBranches,
        loading: { ...prev.loading, branches: false }
      }));
    } catch (error: any) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, branches: false },
        errors: { ...prev.errors, branches: error.message || 'Failed to load branches' }
      }));
    }
  }, []);

  // Load configuration
  const loadConfiguration = useCallback(async () => {
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, config: true },
      errors: { ...prev.errors, config: null }
    }));

    try {
      const [systemConfig, validationRules] = await Promise.all([
        dataService.getSystemConfiguration(),
        dataService.getValidationRules()
      ]);

      setData(prev => ({
        ...prev,
        systemConfig,
        validationRules,
        loading: { ...prev.loading, config: false }
      }));
    } catch (error: any) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, config: false },
        errors: { ...prev.errors, config: error.message || 'Failed to load configuration' }
      }));
    }
  }, []);

  // Load static data
  const loadStaticData = useCallback(async () => {
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, staticData: true },
      errors: { ...prev.errors, staticData: null }
    }));

    try {
      const [
        countries,
        states,
        occupationTypes,
        idProofTypes,
        incomeRanges
      ] = await Promise.all([
        dataService.getCountries(),
        dataService.getStates(),
        dataService.getOccupationTypes(),
        dataService.getIdProofTypes(),
        dataService.getIncomeRanges()
      ]);

      setData(prev => ({
        ...prev,
        countries,
        states,
        occupationTypes,
        idProofTypes,
        incomeRanges,
        loading: { ...prev.loading, staticData: false }
      }));
    } catch (error: any) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, staticData: false },
        errors: { ...prev.errors, staticData: error.message || 'Failed to load static data' }
      }));
    }
  }, []);

  // Load all data
  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadEnumOptions(),
      loadBranches(),
      loadConfiguration(),
      loadStaticData()
    ]);
  }, [loadEnumOptions, loadBranches, loadConfiguration, loadStaticData]);

  // Refresh specific data
  const refreshBranches = useCallback(() => {
    loadBranches();
  }, [loadBranches]);

  const refreshConfiguration = useCallback(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  // Clear cache and reload
  const clearCacheAndReload = useCallback(() => {
    dataService.clearCache();
    loadAllData();
  }, [loadAllData]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Helper functions
  const getBranchById = useCallback((id: number) => {
    return data.branches.find(branch => branch.id === id);
  }, [data.branches]);

  const getBranchByCode = useCallback((code: string) => {
    return data.branches.find(branch => branch.branchCode === code);
  }, [data.branches]);

  const getEnumLabel = useCallback((options: EnumOption[], value: number) => {
    return options.find(option => option.value === value)?.label || 'Unknown';
  }, []);

  // Check if any data is loading
  const isLoading = Object.values(data.loading).some(loading => loading);
  
  // Check if there are any errors
  const hasErrors = Object.values(data.errors).some(error => error !== null);

  return {
    data,
    isLoading,
    hasErrors,
    
    // Refresh functions
    refreshBranches,
    refreshConfiguration,
    clearCacheAndReload,
    loadAllData,
    
    // Helper functions
    getBranchById,
    getBranchByCode,
    getEnumLabel,
    
    // Specific loaders
    loadEnumOptions,
    loadBranches,
    loadConfiguration,
    loadStaticData
  };
};

export default useBackendData;
