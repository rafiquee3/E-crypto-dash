import { globalDataMock, marketDataMock } from '@/mocks/data/marketDataMock';
import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly assetList: Locator;
  readonly loadingSpinner: Locator;
  readonly searchInput: Locator;
  readonly currencySelector: Locator;

  constructor(page: Page) {
    this.page = page;
    this.assetList = page.locator('[data-testid="asset-list"]');
    this.loadingSpinner = page.getByText(/Loading/i);
    this.searchInput = page.getByPlaceholder('Search coins...');
    this.currencySelector = page.locator('[data-testid="currency-selector"]');
  }

  async syncData() {
    await this.page.route('**/api/markets*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(marketDataMock),
      });
    });

    await this.page.route('**/api/markets/global*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(globalDataMock),
      });
    });
  }
  async goto() {
    await this.syncData();
    await this.page.goto('/');
  }

  async waitForDataLoad() {
    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 10000 });
  }

  async clickCoin(coinName: string) {
    await this.page.getByText(coinName, { exact: false }).first().click();
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query);
  }

  async selectSearchResult(coinName: string) {
    await this.page
      .getByRole('option', { name: new RegExp(coinName, 'i') })
      .first()
      .click();
  }
}
