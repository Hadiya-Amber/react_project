// Consolidated Validation Utility - Combines all validation functions
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validation = {
  // Common patterns
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phoneStrict: /^(\+91|91)?[6-9]\d{9}$/,
    otp: /^\d{6}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    amount: /^\d+(\.\d{1,2})?$/
  },

  // Validate single field
  validateField(value: any, rules: ValidationRule): string | null {
    if (rules.required && (!value || value.toString().trim() === '')) {
      return rules.message || 'This field is required';
    }

    if (!value) return null;

    const stringValue = value.toString().trim();

    if (rules.minLength && stringValue.length < rules.minLength) {
      return rules.message || `Minimum ${rules.minLength} characters required`;
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return rules.message || `Maximum ${rules.maxLength} characters allowed`;
    }

    if (rules.pattern && !rules.pattern.test(stringValue)) {
      return rules.message || 'Invalid format';
    }

    if (rules.custom && !rules.custom(value)) {
      return rules.message || 'Invalid value';
    }

    return null;
  },

  // Validate entire form
  validateForm(data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, fieldRules] of Object.entries(rules)) {
      const error = this.validateField(data[field], fieldRules);
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Email validation
  validateEmail(email: string): ValidationResult {
    if (!email.trim()) {
      return { isValid: false, errors: { email: 'Email is required' } };
    }
    
    if (!this.patterns.email.test(email)) {
      return { isValid: false, errors: { email: 'Please enter a valid email address' } };
    }
    
    return { isValid: true, errors: {} };
  },

  // OTP validation
  validateOtpCode(otpCode: string): ValidationResult {
    if (!otpCode.trim()) {
      return { isValid: false, errors: { otp: 'OTP code is required' } };
    }
    
    const cleanOtp = otpCode.replace(/\s/g, '');
    if (!this.patterns.otp.test(cleanOtp)) {
      return { isValid: false, errors: { otp: 'OTP must be 6 digits' } };
    }
    
    return { isValid: true, errors: {} };
  },

  // Phone validation
  validateIndianMobile(phone: string): PhoneValidationResult {
    if (!phone.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }

    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return { isValid: true, formatted: `+91${digits}` };
    }
    
    if (digits.length === 12 && digits.startsWith('91') && /^91[6-9]/.test(digits)) {
      return { isValid: true, formatted: `+${digits}` };
    }

    return { 
      isValid: false, 
      error: 'Please enter a valid 10-digit Indian mobile number starting with 6-9' 
    };
  },

  // Pre-defined validation rules
  rules: {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    
    otpCode: {
      required: true,
      pattern: /^\d{6}$/,
      message: 'OTP must be 6 digits'
    },
    
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
    },
    
    amount: {
      required: true,
      pattern: /^\d+(\.\d{1,2})?$/,
      custom: (value: string) => parseFloat(value) > 0,
      message: 'Please enter a valid amount'
    },
    
    phone: {
      required: true,
      pattern: /^(\+91|91)?[6-9]\d{9}$/,
      message: 'Please enter a valid 10-digit Indian mobile number'
    }
  }
};

// Validation guard for API calls
export const validationGuard = {
  validateBeforeApiCall(data: any, rules: Record<string, any>): void {
    const validationResult = validation.validateForm(data, rules);
    if (!validationResult.isValid) {
      const firstError = Object.values(validationResult.errors)[0];
      throw new ValidationError(firstError);
    }
  },

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

  rules: {
    email: (email: string) => {
      const result = validation.validateEmail(email);
      if (!result.isValid) throw new ValidationError(result.errors.email);
    },

    otp: (otpCode: string) => {
      const result = validation.validateOtpCode(otpCode);
      if (!result.isValid) throw new ValidationError(result.errors.otp);
    },

    phone: (phone: string) => {
      const result = validation.validateIndianMobile(phone);
      if (!result.isValid) throw new ValidationError(result.error!);
    },

    amount: (amount: string | number) => {
      const amountStr = amount.toString();
      if (!amountStr.trim()) throw new ValidationError('Amount is required');
      if (!/^\d+(\.\d{1,2})?$/.test(amountStr)) throw new ValidationError('Invalid amount format');
      if (parseFloat(amountStr) <= 0) throw new ValidationError('Amount must be greater than 0');
    },

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
 
      if (idProofType === 'Aadhaar Card' && !/^\d{12}$/.test(idProofNumber)) {
        throw new ValidationError('Aadhaar number must be 12 digits');
      }
 
      if (idProofType === 'PAN Card' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idProofNumber)) {
        throw new ValidationError('PAN number format is invalid (e.g., ABCDE1234F)');
      }
    }
  }
};

// Legacy exports for backward compatibility
export const formValidation = validation;
export const otpValidation = {
  validateEmail: validation.validateEmail,
  validateOtpCode: validation.validateOtpCode,
  validateOtpRequest: (email: string) => validation.validateEmail(email),
  validateOtpVerification: (email: string, otpCode: string) => {
    const emailResult = validation.validateEmail(email);
    if (!emailResult.isValid) return emailResult;
    return validation.validateOtpCode(otpCode);
  }
};
export const phoneValidation = {
  validateIndianMobile: validation.validateIndianMobile,
  formatPhone: (phone: string) => phone,
  cleanPhone: (phone: string) => phone.replace(/\D/g, '')
};