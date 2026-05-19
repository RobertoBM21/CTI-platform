import { expect, test } from '@playwright/test';

// ── Threat Domain catalog ──────────────────────────────────────────────

test.describe('Threat Domain catalog', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/threat-domain');
        await expect(page.getByRole('main')).toBeVisible();
    });

    test('shows Threat Domain heading', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /threat domain/i }),
        ).toBeVisible();
    });

    test('shows All tab', async ({ page }) => {
        await expect(page.getByRole('tab', { name: /^all$/i })).toBeVisible({
            timeout: 5_000,
        });
    });

    test('shows Incidents tab', async ({ page }) => {
        await expect(
            page.getByRole('tab', { name: /^incidents$/i }),
        ).toBeVisible();
    });

    test('shows Campaigns tab', async ({ page }) => {
        await expect(
            page.getByRole('tab', { name: /^campaigns$/i }),
        ).toBeVisible();
    });

    test('shows Threat Actors tab', async ({ page }) => {
        await expect(
            page.getByRole('tab', { name: /threat actors/i }),
        ).toBeVisible();
    });

    test('shows Attack Patterns tab', async ({ page }) => {
        await expect(
            page.getByRole('tab', { name: /attack patterns/i }),
        ).toBeVisible();
    });

    test('All tab shows results from multiple entity types', async ({
        page,
    }) => {
        const entities = page.locator(
            'a[href^="/incidents/"], a[href^="/campaigns/"], a[href^="/threat-actors/"]',
        );
        await expect(entities.first()).toBeVisible({ timeout: 10_000 });
    });

    test('Incidents tab shows incidents', async ({ page }) => {
        await page.getByRole('tab', { name: /^incidents$/i }).click();
        await expect(
            page.locator('a[href^="/incidents/"]').first(),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('Campaigns tab shows campaigns', async ({ page }) => {
        await page.getByRole('tab', { name: /^campaigns$/i }).click();
        await expect(
            page.locator('a[href^="/campaigns/"]').first(),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('Threat Actors tab shows threat actors', async ({ page }) => {
        await page.getByRole('tab', { name: /threat actors/i }).click();
        await expect(
            page.locator('a[href^="/threat-actors/"]').first(),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('Attack Patterns tab shows a table', async ({ page }) => {
        await page.getByRole('tab', { name: /attack patterns/i }).click();
        await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 });
    });

    test('search input is visible', async ({ page }) => {
        await expect(
            page.getByPlaceholder(/search/i).or(page.getByRole('searchbox')),
        ).toBeVisible({ timeout: 5_000 });
    });

    test('sidebar link navigates to threat domain', async ({ page }) => {
        await page.goto('/');
        const link = page.getByRole('link', { name: /threat domain/i }).first();
        await link.click();
        await expect(page).toHaveURL(/\/threat-domain/);
    });
});
