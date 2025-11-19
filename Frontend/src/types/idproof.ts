export enum IdProofType {
  Aadhaar = 0,
  VoterId = 1
}

export const IdProofTypeLabels = {
  [IdProofType.Aadhaar]: 'Aadhaar Card',
  [IdProofType.VoterId]: 'Voter ID Card'
} as const;

export const getIdProofTypeLabel = (type: IdProofType): string => 
  IdProofTypeLabels[type] || 'Unknown';

// Validation patterns
export const IdProofValidation = {
  [IdProofType.Aadhaar]: {
    pattern: /^\d{4}\s?\d{4}\s?\d{4}$/,
    message: 'Aadhaar number must be 12 digits (e.g., 1234 5678 9012)',
    placeholder: '1234 5678 9012'
  },
  [IdProofType.VoterId]: {
    pattern: /^[A-Z]{3}\d{7}$/,
    message: 'Voter ID must be 3 letters followed by 7 digits (e.g., ABC1234567)',
    placeholder: 'ABC1234567'
  }
};
