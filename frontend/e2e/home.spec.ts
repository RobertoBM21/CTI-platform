import { expect, test } from '@playwright/test';

function escapeForRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

    const threatDomainTab = page
        .locator('nav[aria-label="Dashboard tabs"]')
        .getByRole('button', { name: /^threat domain$/i });
    await expect(threatDomainTab).toBeVisible({ timeout: 10_000 });
    await threatDomainTab.click({ force: true });

    const campaignTrigger = page.getByRole('combobox').nth(1);

    await expect(campaignTrigger).toBeVisible({ timeout: 15_000 });
    await expect(campaignTrigger).toContainText(/select campaign/i);

    await campaignTrigger.click();
    const option = page.getByRole('option').first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    const selectedLabel = (await option.textContent())?.trim() ?? '';
    await option.click();
    await expect(campaignTrigger).not.toContainText(/select campaign/i);
    await expect(campaignTrigger).toContainText(selectedLabel);

    await campaignTrigger.click();
    await page
        .getByRole('option', {
            name: new RegExp(escapeForRegex(selectedLabel), 'i'),
        })
        .first()
        .click();
    await expect(campaignTrigger).toContainText(/select campaign/i);
});
