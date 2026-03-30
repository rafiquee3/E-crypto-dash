import {
  CoinMarketData,
  CoinMarketDataListSchema,
  CoinMarketParams,
  GlobalDataSchema,
  GlobalData,
  CoinDetailDataSchema,
  CoinDetailData,
  SearchResponseSchema,
  SearchResponse,
} from '@/types/yup';
import { ICryptoDataProvider } from './ICryptoDataProvider';

export class CoinGeckoAdapter implements ICryptoDataProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('CoinGecko API key is required');
    }
    this.apiKey = apiKey;
  }

  async fetchMarketData(
    params: Partial<CoinMarketParams> & { vs_currency: string },
  ): Promise<CoinMarketData[]> {
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
      next: { revalidate: 60 },
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
      next: { revalidate: 60 },
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

  async fetchCoinData(currency: string, coinId: string): Promise<CoinDetailData> {
    const [marketRes, chartRes1, chartRes7, chartRes30, chartRes90, chartRes365] =
      await Promise.all([
        fetch(`${this.baseUrl}/coins/${coinId}?localization=false&tickers=false`, {
          headers: {
            'x-cg-demo-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        }), // 1 7 30 90 365
        fetch(`${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${1}`, {
          headers: {
            'x-cg-demo-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        }),
        fetch(`${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${7}`, {
          headers: {
            'x-cg-demo-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        }),
        fetch(`${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${30}`, {
          headers: {
            'x-cg-demo-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        }),
        fetch(`${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${90}`, {
          headers: {
            'x-cg-demo-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        }),
        fetch(`${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${365}`, {
          headers: {
            'x-cg-demo-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        }),
      ]);

    if (!marketRes.ok) {
      throw this.handleApiError(marketRes);
    }

    if (!chartRes1.ok) throw this.handleApiError(chartRes1);
    if (!chartRes7.ok) throw this.handleApiError(chartRes7);
    if (!chartRes30.ok) throw this.handleApiError(chartRes30);
    if (!chartRes90.ok) throw this.handleApiError(chartRes90);
    if (!chartRes365.ok) throw this.handleApiError(chartRes365);

    let marketData = await marketRes.json();
    const [c1, c7, c30, c90, c365] = await Promise.all([
      chartRes1.json(),
      chartRes7.json(),
      chartRes30.json(),
      chartRes90.json(),
      chartRes365.json(),
    ]);

    if (typeof marketData === 'string') {
      try {
        marketData = JSON.parse(marketData);
      } catch (err) {
        console.warn('Failed to parse JSON string from response', err);
      }
    }

    const chartMap: Record<string, any> = {
      '1': c1,
      '7': c7,
      '30': c30,
      '90': c90,
      '365': c365,
    };

    const data = {
      stats: {
        price: marketData.market_data.current_price[currency],
        marketCap: marketData.market_data.market_cap[currency],
        volume: marketData.market_data.total_volume[currency],
        supply: marketData.market_data.circulating_supply,
        change24h: marketData.market_data.price_change_percentage_24h,
        high24h: marketData.market_data.high_24h[currency],
        low24h: marketData.market_data.low_24h[currency],
        ath: marketData.market_data.ath[currency],
        athChange: marketData.market_data.ath_change_percentage[currency],
        rank: marketData.market_cap_rank,
      },
      chart: {
        '1': chartMap['1'].prices,
        '7': chartMap['7'].prices,
        '30': chartMap['30'].prices,
        '90': chartMap['90'].prices,
        '365': chartMap['365'].prices,
      },
    };

    return CoinDetailDataSchema.validateSync(data, {
      abortEarly: false,
      strict: false,
    }) as CoinDetailData;
  }

  async search(query: string): Promise<SearchResponse> {
    const queryParams = new URLSearchParams({ query }).toString();
    const response = await fetch(`${this.baseUrl}/search?${queryParams}`, {
      headers: {
        'x-cg-demo-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
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

    const data = rawData;
    return SearchResponseSchema.validateSync(data, {
      abortEarly: false,
      strict: false,
    }) as SearchResponse;
  }

  private handleApiError(response: Response): Error {
    const errorMessages: Record<number, string> = {
      401: 'Invalid CoinGecko API credentials',
      403: 'Access forbidden',
      429: 'Rate limit exceeded',
    };

    return new Error(errorMessages[response.status] ?? `API error (status: ${response.status})`);
  }
}
