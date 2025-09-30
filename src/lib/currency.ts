export const formatCurrency = (amount: number): string => {
  // Format amount in Indonesian Rupiah (IDR)
  // Example: 5000 => "Rp 5.000,00", 1250000 => "Rp 1.250.000,00"
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  // Parse Indonesian currency string to number
  // Remove everything except digits
  const numericValue = value.replace(/[^\d]/g, '');
  return parseInt(numericValue, 10) || 0;
};