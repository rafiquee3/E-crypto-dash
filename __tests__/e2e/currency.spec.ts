import { test, expect } from '@playwright/test';
import { CoinDetailPage } from './pages/CoinDetailPage';

test.describe('Currency Selector', () => {
  test('should change currency and update prices', async ({ page }) => {
    const coinDetail = new CoinDetailPage(page);
    await coinDetail.goto('bitcoin');
    await coinDetail.waitForDataLoad();

    const initialPrice = await page.locator('h2').first().textContent();
    expect(initialPrice).toContain('$');

    await page.locator('header select').selectOption('eur');

    // Wait for the currency change to take effect (API call + price update)
    await expect(page.locator('h2').first()).toContainText('€', { timeout: 10000 });
  });

  test('should persist currency preference after refresh', async ({ page }) => {
    const coinDetail = new CoinDetailPage(page);
    await coinDetail.goto('bitcoin');
    await coinDetail.waitForDataLoad();

    await page.locator('header select').selectOption('eur');
    await page.waitForTimeout(1000);
    await page.reload();
    await coinDetail.waitForDataLoad();

    await expect(page.locator('h2').first()).toContainText('€', { timeout: 10000 });
  });
});
