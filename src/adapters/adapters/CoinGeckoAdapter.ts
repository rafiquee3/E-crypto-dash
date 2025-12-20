import { CoinMarketData, CoinMarketDataListSchema, CoinMarketDataSchema, CoinMarketParams } from "@/types/yup";
import { ICryptoDataProvider } from "./ICryptoDataProvider";

export class CoinGeckoAdapter implements ICryptoDataProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('CoinGecko API key is required');
    }
    this.apiKey = apiKey;
  }

  async fetchMarketData(params: CoinMarketParams): Promise<CoinMarketData[]> {
    const queryParams = new URLSearchParams({
      vs_currency: params.vs_currency,
      per_page: String(params.per_page ?? 15),
      page: String(params.page ?? 1),
      sparkline: String(params.sparkline ?? false),
      price_change_percentage: params.price_change_percentage ?? '1h,24h,7d',
      order: params.order ?? 'market_cap_desc',
    }).toString();

    const response = await fetch(`${this.baseUrl}/coins/markets?${queryParams}`, {
        headers: {
          'x-cg-demo-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (!response.ok) {
      throw this.handleApiError(response);
    }

    const rawData = await response.json();

    return CoinMarketDataListSchema.validateSync(rawData, {
      abortEarly: false,
      strict: false,
    }) as CoinMarketData[];
  }

    private handleApiError(response: Response): Error {
    const errorMessages: Record<number, string> = {
      401: 'Invalid CoinGecko API credentials',
      403: 'Access forbidden',
      429: 'Rate limit exceeded',
    };

    return new Error(
      errorMessages[response.status] ??
      `API error (status: ${response.status})`
    );
  }
}
