import { http, HttpResponse } from 'msw'
import { marketDataMock } from './data/marketDataMock'
import { globalDataMock } from './data/globalDataMock';

export const handlers = [
  http.get(`/api/markets`, () => {
    return HttpResponse.json(marketDataMock);
  }),
  http.get(`/api/markets/global`, () => {
    return HttpResponse.json(globalDataMock.data);
  }),
];
