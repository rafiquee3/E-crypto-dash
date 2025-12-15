import { CoinMarketDataSchema } from "@/src/types/yup";

describe('CoinMarketDataSchema', () => {

  describe('Validation - Success', () => {
    
    it('should validate correctly when all fields are provided with valid data', async () => {
      const fullData = {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
        current_price: 90121,
        market_cap: 1798554785166,
        market_cap_rank: 1,
        total_volume: 42114156779,
        price_change_percentage_1h_in_currency: 0.08079278025399927,
        price_change_percentage_24h_in_currency: 0.28152784351504806,
        price_change_percentage_7d_in_currency: 0.043914136570820946,
      };

      const result = await CoinMarketDataSchema.validate(fullData);
      
      expect(result).toStrictEqual(fullData);
    });

    it('should validate correctly when only the required subset of fields is provided', async () => {
      const minimalData = {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
        current_price: 90121,
      };

      const result = await CoinMarketDataSchema.validate(minimalData);

      expect(result).toMatchObject(minimalData);
    });

    it('should allow null values for price change percentages (handling new coins)', async () => {
      const dataWithNulls = {
        id: "new-coin",
        symbol: "nc",
        name: "New Coin",
        image: "https://url.com",
        current_price: 100,
        price_change_percentage_1h_in_currency: null,
        price_change_percentage_24h_in_currency: null,
        price_change_percentage_7d_in_currency: null,
      };

      const result = await CoinMarketDataSchema.validate(dataWithNulls);
      
      expect(result.price_change_percentage_1h_in_currency).toBeNull();
      expect(result.price_change_percentage_24h_in_currency).toBeNull();
    });

  });

  describe('Validation - Errors & Constraints', () => {

    it('should throw a validation error when required fields are missing', async () => {
      const incompleteData = {
        id: "bitcoin",
      };

      await expect(CoinMarketDataSchema.validate(incompleteData))
        .rejects.toThrow(/Required/i);
    });

    it('should reject when unknown properties are provided in strict mode', async () => {
      const dataWithUnknown = {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://url.com",
        current_price: 90000,
        unknown_field: 'not_allowed'
      };

      await expect(CoinMarketDataSchema.validate(dataWithUnknown, { strict: true }))
        .rejects.toThrow(/Unknown/i);
    });

    it('should reject when price fields are not valid numbers', async () => {
      const invalidPriceData = {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://url.com",
        current_price: "invalid_number_string"
      };

      await expect(CoinMarketDataSchema.validate(invalidPriceData))
        .rejects.toThrow(/number/i);
    });
  });
});