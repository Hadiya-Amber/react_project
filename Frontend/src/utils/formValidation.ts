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

export const formValidation = {
  // Common validation patterns
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phoneBasic: /^\+?[\d\s-()]{10,}$/,
    phoneStrict: /^(\+91|91)?[6-9]\d{9}$/,
    phoneInternational: /^\+?[1-9]\d{1,14}$/,
    otp: /^\d{6}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    accountNumber: /^\d{10,16}$/,
    amount: /^\d+(\.\d{1,2})?$/
  },

  // Validate single field
  validateField(value: any, rules: ValidationRule): string | null {
    if (rules.required && (!value || value.toString().trim() === '')) {
      return rules.message || 'This field is required';
    }

    if (!value) return null; // Skip other validations if not required and empty

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

  // Pre-defined validation rules for common fields
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
    
    confirmPassword: (password: string) => ({
      required: true,
      custom: (value: string) => value === password,
      message: 'Passwords do not match'
    }),
    
    amount: {
      required: true,
      pattern: /^\d+(\.\d{1,2})?$/,
      custom: (value: string) => parseFloat(value) > 0,
      message: 'Please enter a valid amount'
    },
    
    // Account numbers are system-generated, no validation needed
    
    phone: {
      required: true,
      pattern: /^(\+91|91)?[6-9]\d{9}$/,
      message: 'Please enter a valid 10-digit Indian mobile number'
    },
    
    phoneInternational: {
      required: true,
      pattern: /^\+?[1-9]\d{1,14}$/,
      message: 'Please enter a valid international phone number'
    },
    
    phoneBasic: {
      required: true,
      minLength: 10,
      maxLength: 15,
      pattern: /^\+?[\d\s-()]{10,}$/,
      message: 'Please enter a valid phone number (10-15 digits)'
    }
  }
};