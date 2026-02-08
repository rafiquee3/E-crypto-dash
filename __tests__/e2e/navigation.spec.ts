import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { CoinDetailPage } from './pages/CoinDetailPage';

test.describe('Navigation', () => {
  test('should navigate from home page to coin details', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.waitForDataLoad();
    await homePage.clickCoin('Bitcoin');

    await expect(page).toHaveURL(/\/coin\/bitcoin/i);

    const coinDetail = new CoinDetailPage(page);
    await coinDetail.waitForDataLoad();

    await expect(coinDetail.marketCapRank).toBeVisible();
  });

  test('should return to home page via logo', async ({ page }) => {
    const coinDetail = new CoinDetailPage(page);
    await coinDetail.goto('ethereum');
    await coinDetail.waitForDataLoad();

    await page.getByText('CryptoDash').first().click();

    await expect(page).toHaveURL('/');
  });
});
