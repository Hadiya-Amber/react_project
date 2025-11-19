import { formValidation } from './formValidation';
import { phoneValidation } from './phoneValidation';
import { otpValidation } from './otpValidation';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validationGuard = {
  // Validate before any API call
  validateBeforeApiCall(data: any, rules: Record<string, any>): void {
    const validation = formValidation.validateForm(data, rules);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new ValidationError(firstError);
    }
  },

  // Validate account creation data (no account number validation - system generated)
  validateAccountCreation(data: any): void {
    this.rules.required(data.accountType, 'Account type');
    this.rules.initialDeposit(data.initialDeposit);
    this.rules.required(data.purpose?.trim(), 'Purpose');
    this.rules.required(data.addressLine1?.trim(), 'Address line 1');
    this.rules.required(data.city?.trim(), 'City');
    this.rules.required(data.state?.trim(), 'State');
    this.rules.postalCode(data.postalCode);
    this.rules.required(data.branchId, 'Branch');
    this.rules.required(data.emergencyContactName?.trim(), 'Emergency contact name');
    this.rules.phone(data.emergencyContactPhone);
    this.rules.required(data.idProofType, 'ID proof type');
    this.rules.idProofNumber(data.idProofNumber, data.idProofType);
    
    if (!data.termsAndConditionsAccepted) {
      throw new ValidationError('You must accept the terms and conditions');
    }
    if (!data.privacyPolicyAccepted) {
      throw new ValidationError('You must accept the privacy policy');
    }
    if (!data.antiMoneyLaunderingConsent) {
      throw new ValidationError('You must provide anti-money laundering consent');
    }
  },

  // Common validation rules for different data types
  rules: {
    email: (email: string) => {
      const result = otpValidation.validateEmail(email);
      if (!result.isValid) throw new ValidationError(result.error!);
    },

    otp: (otpCode: string) => {
      const result = otpValidation.validateOtpCode(otpCode);
      if (!result.isValid) throw new ValidationError(result.error!);
    },

    phone: (phone: string) => {
      const result = phoneValidation.validateIndianMobile(phone);
      if (!result.isValid) throw new ValidationError(result.error!);
    },

    amount: (amount: string | number) => {
      const amountStr = amount.toString();
      if (!amountStr.trim()) throw new ValidationError('Amount is required');
      if (!/^\d+(\.\d{1,2})?$/.test(amountStr)) throw new ValidationError('Invalid amount format');
      if (parseFloat(amountStr) <= 0) throw new ValidationError('Amount must be greater than 0');
    },

    // Note: Account numbers are system-generated, no validation needed for creation

    required: (value: any, fieldName: string) => {
      if (!value || value.toString().trim() === '') {
        throw new ValidationError(`${fieldName} is required`);
      }
    },

    password: (password: string) => {
      if (!password.trim()) throw new ValidationError('Password is required');
      if (password.length < 6) throw new ValidationError('Password must be at least 6 characters');
    },

    loginCredentials: (email: string, password: string) => {
      if (!email.trim()) throw new ValidationError('Email is required');
      if (!password.trim()) throw new ValidationError('Password is required');
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new ValidationError('Please enter a valid email address');
    },

    postalCode: (postalCode: string) => {
      if (!postalCode.trim()) throw new ValidationError('Postal code is required');
      if (!/^\d{6}$/.test(postalCode)) throw new ValidationError('Postal code must be 6 digits');
    },

    initialDeposit: (amount: number) => {
      if (!amount || amount < 100) throw new ValidationError('Minimum initial deposit is ₹100');
      if (amount > 10000000) throw new ValidationError('Maximum initial deposit is ₹1,00,00,000');
    },

    idProofNumber: (idProofNumber: string, idProofType: string) => {
      if (!idProofNumber.trim()) throw new ValidationError('ID proof number is required');
      
      // Aadhaar validation
      if (idProofType === 'Aadhaar Card' && !/^\d{12}$/.test(idProofNumber)) {
        throw new ValidationError('Aadhaar number must be 12 digits');
      }
      // PAN validation
      if (idProofType === 'PAN Card' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idProofNumber)) {
        throw new ValidationError('PAN number format is invalid (e.g., ABCDE1234F)');
      }
    }
  }
};