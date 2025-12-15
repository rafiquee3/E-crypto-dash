process.env.COINGECKO_API_KEY_SECRET = 'TEST_API_KEY';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

try {
  const undici = require('undici');
  global.fetch = undici.fetch as any;
  global.Request = undici.Request as any;
  global.Response = undici.Response as any;
  global.Headers = undici.Headers as any;
} catch (err) {
  const nodeFetch = require('node-fetch');
  global.fetch = nodeFetch as any;
  global.Request = nodeFetch.Request as any;
  global.Response = nodeFetch.Response as any;
  global.Headers = nodeFetch.Headers as any;
}

import '@testing-library/jest-dom';
import { server } from './src/mocks/node';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
