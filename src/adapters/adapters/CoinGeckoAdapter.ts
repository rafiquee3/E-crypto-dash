import { CoinMarketData, CoinMarketDataListSchema, CoinMarketDataSchema, CoinMarketParams, GlobalDataSchema, GlobalData, CoinDetailDataSchema, CoinDetailData } from "@/types/yup";
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

  async fetchCoinData(currency: string, coinId: string) {
    const [marketRes, chartRes] = await Promise.all([
      fetch(`${this.baseUrl}/coins/${coinId}?localization=false&tickers=false`, {
      headers: {
        'x-cg-demo-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
      }),
      fetch(`${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=${currency}&days=1`, {
      headers: {
        'x-cg-demo-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
      })
    ]);
     console.log('mark', marketRes , 'chart', chartRes)
    if (!marketRes.ok) {
      throw this.handleApiError(marketRes);
    };

    if (!chartRes.ok) {
      throw this.handleApiError(chartRes);
    };

    let marketData = await marketRes.json();
    let chartData = await chartRes.json();

    if (typeof marketData === 'string') {
        try {
            marketData = JSON.parse(marketData);
        } catch (err) {
            console.warn('Failed to parse JSON string from response', err);
        }
    }

    if (typeof chartData === 'string') {
        try {
            chartData = JSON.parse(chartData);
        } catch (err) {
            console.warn('Failed to parse JSON string from response', err);
        }
    }

    const data = {
      stats: {
        price: marketData.market_data.current_price[currency],
        marketCap: marketData.market_data.market_cap[currency],
        volume: marketData.market_data.total_volume[currency],
        supply: marketData.market_data.circulating_supply,
      },
      chart: chartData.prices
    };

    return CoinDetailDataSchema.validateSync(data, {
      abortEarly: false,
      strict: false,
    }) as CoinDetailData;
  };

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
