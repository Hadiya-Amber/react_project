export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

export const phoneValidation = {
  // Indian mobile number validation
  validateIndianMobile(phone: string): PhoneValidationResult {
    if (!phone.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Check for Indian mobile patterns
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return { isValid: true, formatted: `+91${digits}` };
    }
    
    if (digits.length === 12 && digits.startsWith('91') && /^91[6-9]/.test(digits)) {
      return { isValid: true, formatted: `+${digits}` };
    }
    
    if (digits.length === 13 && digits.startsWith('091')) {
      const mobile = digits.substring(1);
      return { isValid: true, formatted: `+${mobile}` };
    }

    return { 
      isValid: false, 
      error: 'Please enter a valid 10-digit Indian mobile number starting with 6-9' 
    };
  },

  // International phone validation
  validateInternational(phone: string): PhoneValidationResult {
    if (!phone.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }

    const digits = phone.replace(/\D/g, '');
    
    if (digits.length < 7 || digits.length > 15) {
      return { 
        isValid: false, 
        error: 'Phone number must be between 7-15 digits' 
      };
    }

    // Basic international format check
    if (!/^[1-9]/.test(digits)) {
      return { 
        isValid: false, 
        error: 'Phone number cannot start with 0' 
      };
    }

    const formatted = phone.startsWith('+') ? phone : `+${digits}`;
    return { isValid: true, formatted };
  },

  // Format phone number for display
  formatPhone(phone: string, country: 'IN' | 'INTL' = 'IN'): string {
    const digits = phone.replace(/\D/g, '');
    
    if (country === 'IN') {
      if (digits.length === 10) {
        return `+91 ${digits.substring(0, 5)} ${digits.substring(5)}`;
      }
      if (digits.length === 12 && digits.startsWith('91')) {
        const mobile = digits.substring(2);
        return `+91 ${mobile.substring(0, 5)} ${mobile.substring(5)}`;
      }
    }
    
    return phone;
  },

  // Clean phone number (remove formatting)
  cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }
};