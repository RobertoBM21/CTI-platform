import { expect, test } from '@playwright/test';

test('home page loads and shows heading', async ({ page }) => {
    await page.goto('/');
    await expect(
        page.getByRole('heading', { name: /intelligence dashboard/i }),
    ).toBeVisible();
});

test('threat domain campaign select allows deselect by re-clicking selected option', async ({
    page,
}) => {
    await page.goto('/home');

    await page.getByRole('button', { name: /threat domain/i }).click();

    const selects = page.locator('[data-slot="select-trigger"]');
    const campaignTrigger = selects.nth(1);

    await expect(campaignTrigger).toContainText('Select Campaign');

    await campaignTrigger.click();
    const option = page.getByRole('option', { name: /operación neptuno/i });
    await option.click();
    await expect(campaignTrigger).toContainText(/operación neptuno/i);

    await campaignTrigger.click();
    await page.getByRole('option', { name: /operación neptuno/i }).click();
    await expect(campaignTrigger).toContainText('Select Campaign');
});
