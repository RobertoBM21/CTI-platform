import { expect, test } from '@playwright/test';

test('home page loads and shows heading', async ({ page }) => {
    await page.goto('/');
    await expect(
        page.getByRole('heading', { name: /intelligence dashboard/i }),
    ).toBeVisible();
});
