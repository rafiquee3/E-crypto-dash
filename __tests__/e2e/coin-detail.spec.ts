import { test, expect } from '@playwright/test';
import { CoinDetailPage } from './pages/CoinDetailPage';

test.describe('Coin Detail Page', () => {
  test('should display coin data correctly', async ({ page }) => {
    const coinDetail = new CoinDetailPage(page);
    await coinDetail.goto('bitcoin');
    await coinDetail.waitForDataLoad();

    const price = await coinDetail.getPrice();
    expect(price).toMatch(/[\d,]+/);

    await expect(coinDetail.marketCapRank).toBeVisible();
    await expect(coinDetail.liveChart).toBeVisible();
    await expect(coinDetail.historicalChart).toBeVisible();
  });

  test('should change time range on chart', async ({ page }) => {
    const coinDetail = new CoinDetailPage(page);
    await coinDetail.goto('bitcoin');
    await coinDetail.waitForDataLoad();

    await coinDetail.selectTimeRange('7d');

    const sevenDayButton = page.getByRole('button', { name: '7d' });
    await expect(sevenDayButton).toHaveClass(/bg-gray-700/);
  });

  test('should show 404 for invalid coin', async ({ page }) => {
    await page.goto('/coin/invalidcoinID');

    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
