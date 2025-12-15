import { http, HttpResponse } from 'msw'
import { marketDataMock } from './data/marketDataMock'

export const handlers = [
  http.get(`/api/markets`, () => {
    return HttpResponse.json(marketDataMock);
  }),
];