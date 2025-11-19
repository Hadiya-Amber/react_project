// ✅ Safe utility functions that can throw errors
export const parseCurrency = (amount?: number): string => {
  if (amount == null) {
    throw new Error('Amount is undefined');
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const validateAccountNumber = (accountNumber?: string): string => {
  if (!accountNumber) {
    throw new Error('Account number is required');
  }
  
  if (accountNumber.length < 10) {
    throw new Error('Account number must be at least 10 digits');
  }
  
  return accountNumber;
};

export const validateEmail = (email?: string): string => {
  if (!email) {
    throw new Error('Email is required');
  }
  
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  return email;
};

// ✅ Safe wrapper for validation functions
export const safeValidate = <T>(
  validator: () => T,
  fallback: T
): T => {
  try {
    return validator();
  } catch {
    return fallback;
  }
};
