import { Page, Locator, expect } from '@playwright/test';

export class CoinDetailPage {
  readonly page: Page;
  readonly priceHeading: Locator;
  readonly marketCapRank: Locator;
  readonly liveChart: Locator;
  readonly historicalChart: Locator;
  readonly timeRangeButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.priceHeading = page.locator('h2').first();
    this.marketCapRank = page.getByText('Market Cap Rank');
    this.liveChart = page.getByText('Live Real-time Feed');
    this.historicalChart = page.getByText('Historical Context');
    this.timeRangeButtons = page.locator(
      'button:has-text("24h"), button:has-text("7j"), button:has-text("1M")',
    );
  }

  async goto(coinId: string) {
    await this.page.goto(`/coin/${coinId}`);
  }

  async waitForDataLoad() {
    await expect(this.priceHeading).toBeVisible({ timeout: 10000 });
  }

  async selectTimeRange(range: '24h' | '7j' | '1M' | '3M' | '1A') {
    await this.page.getByRole('button', { name: range }).click();
  }

  async getPrice(): Promise<string> {
    return (await this.priceHeading.textContent()) || '';
  }
}
