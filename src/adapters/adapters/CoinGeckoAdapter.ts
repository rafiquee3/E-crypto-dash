import { CoinMarketData, CoinMarketDataListSchema, CoinMarketDataSchema, CoinMarketParams, GlobalDataSchema, GlobalData } from "@/types/yup";
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

  async fetchMarketData(params: Partial<CoinMarketParams> & {vs_currency: string}): Promise<CoinMarketData[]> {
    if (!params?.vs_currency) {
      throw new Error("The required parameter 'vs_currency' is not available.");
    }

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
        next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw this.handleApiError(response);
    }

    let rawData = await response.json();
      if (typeof rawData === 'string') {
            try {
                rawData = JSON.parse(rawData);
            } catch (err) {
                console.warn('Failed to parse JSON string from response', err);
            }
        }
    return CoinMarketDataListSchema.validateSync(rawData, {
      abortEarly: false,
      strict: false,
    }) as CoinMarketData[];
  }

  async fetchGlobalData(currency: string): Promise<GlobalData> {
    const response = await fetch(`${this.baseUrl}/global`, {
      headers: {
        'x-cg-demo-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw this.handleApiError(response);
    }

    let rawData = await response.json();
    if (typeof rawData === 'string') {
          try {
              rawData = JSON.parse(rawData);
          } catch (err) {
              console.warn('Failed to parse JSON string from response', err);
          }
      }

    const data = rawData.data;

    return GlobalDataSchema(currency).validateSync(data, {
      abortEarly: false,
      strict: false,
    }) as GlobalData;
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
