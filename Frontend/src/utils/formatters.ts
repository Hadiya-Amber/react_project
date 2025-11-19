export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-IN');
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-IN');
};
