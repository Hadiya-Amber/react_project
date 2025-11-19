// Security utility functions for XSS prevention and safe operations

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string safe for display
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input) return '';
  
  // Create a temporary DOM element to leverage browser's built-in HTML escaping
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Safely parses JWT token without throwing errors
 * @param token - JWT token string
 * @returns Parsed token payload or null if invalid
 */
export const safeJwtParse = (token: string | null): any => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.warn('Invalid JWT token format');
    return null;
  }
};

/**
 * Sanitizes account number for safe display
 * @param accountNumber - Account number to sanitize
 * @returns Sanitized account number
 */
export const sanitizeAccountNumber = (accountNumber: string | null | undefined): string => {
  if (!accountNumber) return '';
  return accountNumber.replace(/[^\w\-]/g, '');
};