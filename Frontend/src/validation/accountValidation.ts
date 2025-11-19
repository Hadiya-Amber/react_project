import { z } from 'zod'
import { AccountType } from '@/types/account'

export const createAccountSchema = z.object({
  accountType: z.nativeEnum(AccountType, { errorMap: () => ({ message: 'Account type is required' }) }),
  initialDeposit: z.number().min(100, 'Minimum deposit is ₹100'),
  purpose: z.string().min(1, 'Purpose is required'),
  branchId: z.number().min(1, 'Branch is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  occupation: z.string().min(1, 'Occupation is required'),
  monthlyIncome: z.number().optional(),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().regex(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits'),
  alternateContactPhone: z.string().regex(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits').optional().or(z.literal('')),
  idProofType: z.string().min(1, 'ID proof type is required'),
  idProofNumber: z.string().min(1, 'ID proof number is required'),
  termsAndConditionsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  privacyPolicyAccepted: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  antiMoneyLaunderingConsent: z.boolean().refine(val => val === true, 'Anti-money laundering consent is required'),
})

export const branchSchema = z.object({
  name: z.string().min(3, 'Branch name must be at least 3 characters'),
  code: z.string().min(2, 'Branch code must be at least 2 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  phone: z.string().regex(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits'),
  email: z.string().email('Invalid email address'),
  type: z.enum(['main', 'regional', 'sub'], { errorMap: () => ({ message: 'Branch type is required' }) }),
  isActive: z.boolean(),
  ifscCode: z.string().min(1, 'IFSC code is required').optional(),
})

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Please select source account'),
  toAccountNumber: z.string().min(1, 'Please enter destination account'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
})

export const depositSchema = z.object({
  accountId: z.string().min(1, 'Please select account'),
  amount: z.number().positive('Amount must be positive'),
  depositMode: z.enum(['Cash', 'Cheque', 'Online Transfer', 'DD']),
  description: z.string().optional(),
})

// Type exports
export type CreateAccountFormData = z.infer<typeof createAccountSchema>
export type BranchFormData = z.infer<typeof branchSchema>
export type TransferFormData = z.infer<typeof transferSchema>
export type DepositFormData = z.infer<typeof depositSchema>
