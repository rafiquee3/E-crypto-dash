import numeral from 'numeral';

export const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: `${currency.toUpperCase()}`,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export const formatPercentage = (value: number | null) => value ? (value * 100).toFixed(2) : '';  

export const formatLargeNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
    }

    const formattedValue = numeral(value).format('0.0a').toUpperCase();
    
    return `${formattedValue}`;
};