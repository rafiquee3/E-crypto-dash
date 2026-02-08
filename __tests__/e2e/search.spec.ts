import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Search Functionality', () => {
  test('should search and navigate to coin', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForDataLoad();

    await homePage.searchFor('ethereum');

    await expect(page.getByRole('listbox')).toBeVisible();

    await homePage.selectSearchResult('Ethereum');

    await expect(page).toHaveURL(/\/coin\/ethereum/i);
  });

  test('should show empty state for invalid search', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.searchFor('noexist');

    await expect(page.getByText(/No coins found/i)).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForDataLoad();

    await homePage.searchInput.fill('bit');

    await expect(page.getByRole('listbox')).toBeVisible();
    await page.waitForTimeout(300);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/coin/);
  });
});
