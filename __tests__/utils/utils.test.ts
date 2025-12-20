import { formatPercentage } from "@/utils/utils";
import { formatLargeNumber } from "@/utils/utils";
import { formatCurrency } from "@/utils/utils";

describe('Utility Functions', () => {
    describe('formatCurrency', () => {

        test('should correctly format a standard price in USD', () => {
            expect(formatCurrency(93406, 'usd')).toBe('$93,406.00');
        });

        test('should correctly handle fractional rounding', () => {
            expect(formatCurrency(1234.567, 'eur')).toBe('€1,234.57');
        });
        
        test('should return "N/A" for null, undefined, or NaN input', () => {
            expect(formatCurrency(null as any, '')).toBe('N/A');
            expect(formatCurrency(undefined as any, '')).toBe('N/A');
            expect(formatCurrency(NaN as any, '')).toBe('N/A');
        });
    });

    describe('formatPercentage', () => {
        
        test('should format a positive fraction with a "+" sign', () => {
            expect(formatPercentage(0.0096048)).toBe('+0.96%');
        });

        test('should format a negative fraction with a "-" sign', () => {
            expect(formatPercentage(-0.0523)).toBe('-5.23%');
        });

        test('should format zero correctly', () => {
            expect(formatPercentage(0)).toBe('0.00%'); 
        });

        test('should return "N/A" for null input', () => {
            expect(formatPercentage(null)).toBe('N/A');
        });

        test('should return "N/A" for undefined input', () => {
            expect(formatPercentage(undefined)).toBe('N/A');
        });
    });

    describe('formatLargeNumber', () => {
  
        test('should abbreviate Trillions (T) and handle rounding', () => {
            expect(formatLargeNumber(1864841183579)).toBe('1.9T'); 
        });

        test('should abbreviate Billions (B) and handle rounding', () => {
            expect(formatLargeNumber(50284434446)).toBe('50.3B');
        });

        test('should abbreviate Millions (M)', () => {
            expect(formatLargeNumber(1234567)).toBe('1.2M');
        });
        
        test('should format numbers below M without abbreviation', () => {
            expect(formatLargeNumber(93406)).toBe('93.4K'); 
        });

        test('should return "N/A" for null or undefined input', () => {
            expect(formatLargeNumber(null)).toBe('N/A');
            expect(formatLargeNumber(undefined)).toBe('N/A');
        });
    });
});

