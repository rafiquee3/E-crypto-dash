import numeral from 'numeral';

export const formatCurrency = (value: number | null | undefined, currency: string) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: `${currency.toUpperCase()}`,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';

  return value !== 0 ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` : '0.00%';
};

export const formatLargeNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const formattedValue = numeral(value).format('0.0a').toUpperCase();

  return `${formattedValue}`;
};
