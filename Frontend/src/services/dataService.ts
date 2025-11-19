import api from '@/api/axios';
import { ApiResponse } from '@/types';
import { 
  UserRole, UserStatus, Gender, 
  AccountType, AccountStatus, 
  TransactionType, TransactionStatus,
  OtpPurpose 
} from '@/types';

// Interfaces for backend data
export interface EnumOption {
  value: number;
  label: string;
  description?: string;
}

export interface BranchOption {
  id: number;
  branchName: string;
  branchCode: string;
  city: string;
  state: string;
  ifscCode: string;
  isActive: boolean;
}

export interface SystemConfiguration {
  minTransactionAmount: number;
  maxTransactionAmount: number;
  dailyTransactionLimit: number;
  monthlyTransactionLimit: number;
  interestRates: {
    savings: number;
    current: number;
    minor: number;
  };
  fees: {
    transferFee: number;
    withdrawalFee: number;
    serviceCharge: number;
  };
}

export interface ValidationRules {
  passwordMinLength: number;
  passwordRequireSpecialChar: boolean;
  phoneNumberPattern: string;
  emailPattern: string;
  accountNumberLength: number;
}

export const dataService = {
  // Enum Options - Fetch from backend or use static mapping
  async getUserRoleOptions(): Promise<EnumOption[]> {
    // Since enums are static, we can return them directly
    // But in a real system, these might come from backend for i18n
    return [
      { value: UserRole.Customer, label: 'Customer' },
      { value: UserRole.BranchManager, label: 'Branch Manager' },
      { value: UserRole.Admin, label: 'Administrator' }
    ];
  },

  async getUserStatusOptions(): Promise<EnumOption[]> {
    return [
      { value: UserStatus.Pending, label: 'Pending Approval' },
      { value: UserStatus.Approved, label: 'Approved' },
      { value: UserStatus.Rejected, label: 'Rejected' },
      { value: UserStatus.Suspended, label: 'Suspended' }
    ];
  },

  async getGenderOptions(): Promise<EnumOption[]> {
    return [
      { value: Gender.Male, label: 'Male' },
      { value: Gender.Female, label: 'Female' },
      { value: Gender.Other, label: 'Other' }
    ];
  },

  async getAccountTypeOptions(): Promise<EnumOption[]> {
    return [
      { value: AccountType.Savings, label: 'Savings Account', description: 'For personal savings with interest' },
      { value: AccountType.Current, label: 'Current Account', description: 'For business transactions' },
      { value: AccountType.Minor, label: 'Minor Account', description: 'For customers under 18 years' }
    ];
  },

  async getAccountStatusOptions(): Promise<EnumOption[]> {
    return [
      { value: AccountStatus.Pending, label: 'Pending' },
      { value: AccountStatus.UnderReview, label: 'Under Review' },
      { value: AccountStatus.Active, label: 'Active' },
      { value: AccountStatus.Suspended, label: 'Suspended' },
      { value: AccountStatus.Closed, label: 'Closed' }
    ];
  },

  async getTransactionTypeOptions(): Promise<EnumOption[]> {
    return [
      { value: TransactionType.Deposit, label: 'Deposit' },
      { value: TransactionType.Withdrawal, label: 'Withdrawal' },
      { value: TransactionType.Transfer, label: 'Transfer' },
      { value: 3, label: 'Bill Payment' },
      { value: 4, label: 'Loan Payment' },
      { value: 5, label: 'Payment' },
      { value: 6, label: 'Refund' },
      { value: 7, label: 'Interest' },
      { value: 8, label: 'Fee' },
      { value: 9, label: 'Service Charge' },
      { value: 10, label: 'Reversal' }
    ];
  },

  async getTransactionStatusOptions(): Promise<EnumOption[]> {
    return [
      { value: TransactionStatus.Pending, label: 'Pending' },
      { value: TransactionStatus.Processing, label: 'Processing' },
      { value: TransactionStatus.Completed, label: 'Completed' },
      { value: TransactionStatus.Failed, label: 'Failed' },
      { value: 4, label: 'Cancelled' },
      { value: 5, label: 'Requires Approval' },
      { value: TransactionStatus.Approved, label: 'Approved' },
      { value: TransactionStatus.Rejected, label: 'Rejected' },
      { value: TransactionStatus.Reversed, label: 'Reversed' }
    ];
  },

  // Branch Data - Always fetch from backend
  async getAllBranches(): Promise<BranchOption[]> {
    try {
      const response = await api.get<ApiResponse<BranchOption[]>>('/branch/all');
      if (response.data.success && response.data.data) {
        return response.data.data.filter(branch => branch.isActive);
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      return [];
    }
  },

  async getActiveBranches(): Promise<BranchOption[]> {
    const branches = await this.getAllBranches();
    return branches.filter(branch => branch.isActive);
  },

  // System Configuration - Fetch from backend
  async getSystemConfiguration(): Promise<SystemConfiguration> {
    try {
      const response = await api.get<ApiResponse<SystemConfiguration>>('/admin/system-config');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Failed to fetch system configuration:', error);
    }
    
    // Fallback to default values if backend not available
    return {
      minTransactionAmount: 1,
      maxTransactionAmount: 1000000,
      dailyTransactionLimit: 100000,
      monthlyTransactionLimit: 1000000,
      interestRates: {
        savings: 4.0,
        current: 0.0,
        minor: 5.0
      },
      fees: {
        transferFee: 5,
        withdrawalFee: 2,
        serviceCharge: 10
      }
    };
  },

  // Validation Rules - Fetch from backend
  async getValidationRules(): Promise<ValidationRules> {
    try {
      const response = await api.get<ApiResponse<ValidationRules>>('/admin/validation-rules');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Failed to fetch validation rules:', error);
    }

    // Fallback to default values
    return {
      passwordMinLength: 8,
      passwordRequireSpecialChar: true,
      phoneNumberPattern: '^[6-9]\\d{9}$',
      emailPattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      accountNumberLength: 15
    };
  },

  // Country/State Data - Could be from backend or static
  async getCountries(): Promise<EnumOption[]> {
    // For now, return India only as it's a banking simulation
    return [
      { value: 1, label: 'India' }
    ];
  },

  async getStates(): Promise<EnumOption[]> {
    // Indian states - could be fetched from backend
    return [
      { value: 1, label: 'Andhra Pradesh' },
      { value: 2, label: 'Arunachal Pradesh' },
      { value: 3, label: 'Assam' },
      { value: 4, label: 'Bihar' },
      { value: 5, label: 'Chhattisgarh' },
      { value: 6, label: 'Delhi' },
      { value: 7, label: 'Goa' },
      { value: 8, label: 'Gujarat' },
      { value: 9, label: 'Haryana' },
      { value: 10, label: 'Himachal Pradesh' },
      { value: 11, label: 'Jharkhand' },
      { value: 12, label: 'Karnataka' },
      { value: 13, label: 'Kerala' },
      { value: 14, label: 'Madhya Pradesh' },
      { value: 15, label: 'Maharashtra' },
      { value: 16, label: 'Manipur' },
      { value: 17, label: 'Meghalaya' },
      { value: 18, label: 'Mizoram' },
      { value: 19, label: 'Nagaland' },
      { value: 20, label: 'Odisha' },
      { value: 21, label: 'Punjab' },
      { value: 22, label: 'Rajasthan' },
      { value: 23, label: 'Sikkim' },
      { value: 24, label: 'Tamil Nadu' },
      { value: 25, label: 'Telangana' },
      { value: 26, label: 'Tripura' },
      { value: 27, label: 'Uttar Pradesh' },
      { value: 28, label: 'Uttarakhand' },
      { value: 29, label: 'West Bengal' }
    ];
  },

  // Occupation Types - Could be from backend
  async getOccupationTypes(): Promise<EnumOption[]> {
    return [
      { value: 1, label: 'Salaried Employee' },
      { value: 2, label: 'Business Owner' },
      { value: 3, label: 'Self Employed' },
      { value: 4, label: 'Professional' },
      { value: 5, label: 'Student' },
      { value: 6, label: 'Retired' },
      { value: 7, label: 'Homemaker' },
      { value: 8, label: 'Unemployed' },
      { value: 9, label: 'Other' }
    ];
  },

  // ID Proof Types - Could be from backend
  async getIdProofTypes(): Promise<EnumOption[]> {
    return [
      { value: 1, label: 'Aadhaar Card' },
      { value: 2, label: 'PAN Card' },
      { value: 3, label: 'Passport' },
      { value: 4, label: 'Driving License' },
      { value: 5, label: 'Voter ID' },
      { value: 6, label: 'Ration Card' }
    ];
  },

  // Income Ranges - Could be from backend
  async getIncomeRanges(): Promise<EnumOption[]> {
    return [
      { value: 1, label: 'Below ₹2,00,000' },
      { value: 2, label: '₹2,00,000 - ₹5,00,000' },
      { value: 3, label: '₹5,00,000 - ₹10,00,000' },
      { value: 4, label: '₹10,00,000 - ₹25,00,000' },
      { value: 5, label: '₹25,00,000 - ₹50,00,000' },
      { value: 6, label: 'Above ₹50,00,000' }
    ];
  },

  // Cache management
  private cache: Map<string, { data: any; timestamp: number }> = new Map(),
  private cacheTimeout: number = 5 * 60 * 1000, // 5 minutes

  async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: now });
    return data;
  },

  clearCache(): void {
    this.cache.clear();
  }
};
