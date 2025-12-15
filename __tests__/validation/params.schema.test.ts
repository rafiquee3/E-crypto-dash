import { CoinsMarketParamsSchema } from "@/src/types/yup";

describe('CoinsMarketParamsSchema', () => {

    describe('General / Defaults', () => {
        it('should validate successfully with full valid data', async () => {
            const validData = {
                vs_currency: 'usd',
                per_page: 100,
                page: 1,
                order: 'market_cap_desc',
                sparkline: true,
                price_change_percentage: '1h,24h,7d',
            };

            const result = await CoinsMarketParamsSchema.validate(validData);
            expect(result).toStrictEqual(validData);
        });

        it('should apply default values when only required fields are provided', async () => {
            const result = await CoinsMarketParamsSchema.validate({
                vs_currency: 'usd',
            });

            expect(result).toStrictEqual({
                vs_currency: 'usd',
                per_page: 15,             
                page: 1,                  
                order: 'market_cap_desc', 
                sparkline: false,         
                price_change_percentage: '1h,24h,7d'
            });
        });

        it('should reject unknown properties when in strict mode', async () => {
            const dataWithUnknown = { 
                vs_currency: 'usd',
                unknown_field: 'some_value'
            };

            await expect(CoinsMarketParamsSchema.validate(dataWithUnknown, { strict: true }))
                .rejects.toThrow(/Unknown/);
        });
    });

    describe('vs_currency', () => {
        it('should throw an error if vs_currency is missing', async () => {
            await expect(CoinsMarketParamsSchema.validate({
                per_page: 10,
            })).rejects.toThrow(/required/);
        });

        it('should throw an error for unsupported currency values', async () => {
            await expect(CoinsMarketParamsSchema.validate({
                vs_currency: 'err',
            })).rejects.toThrow(/Currency must be one of/);
        });
    });

    describe('per_page', () => {
        it('should throw an error if per_page exceeds maximum limit', async () => {
            await expect(CoinsMarketParamsSchema.validate({
                vs_currency: 'usd',
                per_page: 251
            })).rejects.toThrow(/maximum/);
        });

        it('should throw an error if per_page is not an integer', async () => {
            await expect(CoinsMarketParamsSchema.validate({
                vs_currency: 'usd',
                per_page: 24.5
            })).rejects.toThrow(/integer/);
        });
    });

    describe('page', () => {
        it('should throw an error if page is less than 1', async () => {
            await expect(CoinsMarketParamsSchema.validate({
                vs_currency: 'usd',
                page: 0
            })).rejects.toThrow(/greater/);
        });

        it('should throw an error if page is not an integer', async () => {
            await expect(CoinsMarketParamsSchema.validate({
                vs_currency: 'usd',
                page: 1.5
            })).rejects.toThrow(/integer/);
        });
    });

    describe('order', () => {
        it('should accept valid sorting options', async () => {
            const result = await CoinsMarketParamsSchema.validate({
                vs_currency: 'usd',
                order: 'market_cap_desc',
            });
            expect(result.order).toBe('market_cap_desc');
        });

        it('should throw an error for invalid sorting options', async () => {
            await expect(CoinsMarketParamsSchema.validate({
                vs_currency: 'usd',
                order: 'invalid_sort',
            })).rejects.toThrow(/Invalid sorting/);
        });
    });

    describe('sparkline (Transformation)', () => {
        const truthyCases = [
            { input: 'true', expected: true },
            { input: 'TRUE', expected: true },
            { input: 'yes', expected: true },
            { input: '1', expected: true },
            { input: true, expected: true },
        ];

        const falsyCases = [
            { input: 'false', expected: false },
            { input: 'no', expected: false },
            { input: '0', expected: false },
            { input: false, expected: false },
        ];

        it.each([...truthyCases, ...falsyCases])(
            'should transform "$input" to $expected', 
            async ({ input, expected }) => {
                const result = await CoinsMarketParamsSchema.validate({ 
                    vs_currency: 'usd', 
                    sparkline: input 
                });
                expect(result.sparkline).toBe(expected);
            }
        );

        it('should return null for invalid sparkline strings', async () => {
            const result = await CoinsMarketParamsSchema.validate({ 
                vs_currency: 'usd', 
                sparkline: 'not-a-boolean' 
            });
            expect(result.sparkline).toBeNull();
        });
    });

    describe('price_change_percentage', () => {
        it('should throw an error for invalid format (e.g., using semicolons)', async () => {
            await expect(CoinsMarketParamsSchema.validate({ 
                vs_currency: 'usd', 
                price_change_percentage: '1h;24h,7d' 
            })).rejects.toThrow(/invalid options/);
        }); 

        it('should throw an error for values not included in the allowed list', async () => {
            await expect(CoinsMarketParamsSchema.validate({ 
                vs_currency: 'usd', 
                price_change_percentage: '1h,24h,99d' 
            })).rejects.toThrow(/invalid options/);
        }); 

        it('should throw an error for duplicate values', async () => {
            await expect(CoinsMarketParamsSchema.validate({ 
                vs_currency: 'usd', 
                price_change_percentage: '1h,24h,7d,7d' 
            })).rejects.toThrow(/duplicates/);
        }); 

        it('should sanitize input by trimming spaces and removing empty elements', async () => {
            const inputWithSpaces = ' 1h ,  24h, 7d ';
            const result = await CoinsMarketParamsSchema.validate({ 
                vs_currency: 'usd', 
                price_change_percentage: inputWithSpaces 
            });
            expect(result.price_change_percentage).toBe('1h,24h,7d');
        });
    });
});