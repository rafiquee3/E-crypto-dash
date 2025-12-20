import { fetchMarketData } from "@/services/cryptoService"
import { CoinMarketData, CoinMarketParams } from "@/types/yup"

export interface ICryptoDataProvider {
    fetchMarketData(params: CoinMarketParams): Promise<CoinMarketData[]>
}
