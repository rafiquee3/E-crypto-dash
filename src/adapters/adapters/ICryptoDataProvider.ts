import { CoinMarketData, CoinMarketParams, GlobalData } from "@/types/yup"

export interface ICryptoDataProvider {
    fetchMarketData(params: CoinMarketParams): Promise<CoinMarketData[]>;
    fetchGlobalData(currency: string): Promise<GlobalData>;
}
