import path from 'path';
import { CoinDetailFrontMock } from '@/mocks/data/marketDataMock';
import { Page, Locator, expect } from '@playwright/test';

export class CoinDetailPage {
  readonly page: Page;
  readonly priceHeading: Locator;
  readonly marketCapRank: Locator;
  readonly liveChart: Locator;
  readonly historicalChart: Locator;
  readonly timeRangeButtons: Locator;

  private readonly mockSocketPath = path.resolve(
    process.cwd(),
    'node_modules/mock-socket/dist/mock-socket.js',
  );

  constructor(page: Page) {
    this.page = page;
    this.priceHeading = page.locator('h2').first();
    this.marketCapRank = page.getByText('Market Cap Rank');
    this.liveChart = page.getByText('Live Real-time Feed');
    this.historicalChart = page.getByText('Historical Context');
    this.timeRangeButtons = page.locator(
      'button:has-text("24h"), button:has-text("7d"), button:has-text("1M")',
    );
  }

  async syncData(coinId: string) {
    // Inject mock-socket library
    await this.page.addInitScript({ path: this.mockSocketPath });

    // Setup the mock server
    await this.page.addInitScript((cid) => {
      // @ts-ignore
      const { Server, WebSocket } = window.Mock;

      // Replace global WebSocket with the mock version
      window.WebSocket = WebSocket;

      const mockServer = new Server(`wss://ws.coincap.io/prices?assets=${cid}`);

      mockServer.on('connection', (socket: any) => {
        const interval = setInterval(() => {
          const price = (60000 + Math.random() * 1000).toString();
          socket.send(JSON.stringify({ [cid]: price }));
        }, 1000);

        socket.on('close', () => {
          clearInterval(interval);
        });
      });
    }, coinId);

    // Mock API Route
    await this.page.route('**/api/coin*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CoinDetailFrontMock),
      });
    });
  }

  async goto(coinId: string) {
    await this.syncData(coinId);
    await this.page.goto(`/coin/${coinId}`);
  }

  async waitForDataLoad() {
    await expect(this.priceHeading).toBeVisible({ timeout: 10000 });
  }

  async selectTimeRange(range: '24h' | '7d' | '1M' | '3M' | '1Y') {
    await this.page.getByRole('button', { name: range }).click();
  }

  async getPrice(): Promise<string> {
    return (await this.priceHeading.textContent()) || '';
  }
}
