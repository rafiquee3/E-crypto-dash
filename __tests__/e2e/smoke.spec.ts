import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('home page should load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /CryptoDash/i })).toBeVisible({ timeout: 15000 });
  });

  test('bitcoin detail page should load', async ({ page }) => {
    await page.goto('/coin/bitcoin');
    await expect(page.getByText(/Bitcoin/i)).toBeVisible({ timeout: 15000 });
  });

  test('API should return data', async ({ page }) => {
    const response = await page.request.get('/api/markets?vs_currency=usd');
    await page.waitForTimeout(1000);
    expect(response.ok()).toBeTruthy();
  });
});
