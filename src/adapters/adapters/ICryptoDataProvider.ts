import {
  CoinDetailData,
  CoinMarketData,
  CoinMarketParams,
  GlobalData,
  SearchResponse,
} from '@/types/yup';

export interface ICryptoDataProvider {
  fetchMarketData(params: CoinMarketParams): Promise<CoinMarketData[]>;
  fetchGlobalData(currency: string): Promise<GlobalData>;
  fetchCoinData(currency: string, coinId: string, days: string): Promise<CoinDetailData>;
  search(query: string): Promise<SearchResponse>;
}
