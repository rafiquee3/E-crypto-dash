import { http, HttpResponse } from 'msw'
import { marketDataMock } from './data/marketDataMock'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const API_MARKETS_URL = `${BASE_URL}/api/markets`;
export const handlers = [
  http.get(API_MARKETS_URL, () => {
    return HttpResponse.json(marketDataMock);
  }),


]