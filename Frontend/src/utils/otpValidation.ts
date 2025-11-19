export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const otpValidation = {
  // Validate email format
  validateEmail(email: string): ValidationResult {
    if (!email.trim()) {
      return { isValid: false, error: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    return { isValid: true };
  },

  // Validate OTP code format
  validateOtpCode(otpCode: string): ValidationResult {
    if (!otpCode.trim()) {
      return { isValid: false, error: 'OTP code is required' };
    }
    
    // Remove spaces and check if it's 6 digits
    const cleanOtp = otpCode.replace(/\s/g, '');
    if (!/^\d{6}$/.test(cleanOtp)) {
      return { isValid: false, error: 'OTP must be 6 digits' };
    }
    
    return { isValid: true };
  },

  // Validate OTP request data
  validateOtpRequest(email: string): ValidationResult {
    const emailValidation = this.validateEmail(email);
    if (!emailValidation.isValid) {
      return emailValidation;
    }
    
    return { isValid: true };
  },

  // Validate OTP verification data
  validateOtpVerification(email: string, otpCode: string): ValidationResult {
    const emailValidation = this.validateEmail(email);
    if (!emailValidation.isValid) {
      return emailValidation;
    }
    
    const otpValidation = this.validateOtpCode(otpCode);
    if (!otpValidation.isValid) {
      return otpValidation;
    }
    
    return { isValid: true };
  }
};