export enum AccountType {
  Minor = 0,
  Major = 1,
  Savings = 2,
  Current = 3
}

export enum AccountStatus {
  Pending = 0,
  UnderReview = 1,
  Active = 2,
  Dormant = 3,
  Closed = 4,
  Suspended = 5
}

export interface Account {
  id: number;
  userId: number;
  branchId: number;
  accountNumber: string;
  type: AccountType;
  balance: number;
  openedDate: string;
  isActive: boolean;
  lastTransactionDate?: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAccountDto {
  accountType: AccountType;
  initialDeposit: number;
  purpose: string;
  branchId: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  occupation: string;
  monthlyIncome?: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  alternateContactPhone?: string;
  idProofDocument: File;
  idProofType: string;
  idProofNumber: string;
  incomeProofDocument?: File;
  termsAndConditionsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  antiMoneyLaunderingConsent: boolean;
}
