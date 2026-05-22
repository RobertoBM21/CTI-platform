import { expect, test } from '@playwright/test';

test.describe('Cyber Domain catalog', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber-domain');
        await expect(
            page.getByRole('heading', { name: /cyber domain/i }),
        ).toBeVisible();
    });

    test('shows Cyber Domain heading', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /cyber domain/i }),
        ).toBeVisible();
    });

    test('shows all tabs', async ({ page }) => {
        await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible({
            timeout: 5_000,
        });
        await expect(
            page.getByRole('button', { name: /malware/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /^tools$/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /^vulnerabilities$/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /^intrusion sets$/i }),
        ).toBeVisible();
    });

    test('All tab shows results from multiple entity types', async ({
        page,
    }) => {
        const entities = page.locator(
            'a[href^="/malware/"], a[href^="/tools/"], a[href^="/vulnerabilities/"], a[href^="/intrusion-sets/"]',
        );
        await expect(entities.first()).toBeVisible({ timeout: 10_000 });
    });

    test('Malware tab shows malware results and updates URL', async ({
        page,
    }) => {
        await page.getByRole('button', { name: /malware/i }).click();
        await page.waitForURL(/tab=malware/, { timeout: 5_000 });
        await expect(page.locator('a[href^="/malware/"]').first()).toBeVisible({
            timeout: 10_000,
        });
    });

    test('Vulnerabilities tab shows vulnerability results', async ({
        page,
    }) => {
        await page.getByRole('button', { name: /^vulnerabilities$/i }).click();
        await page.waitForURL(/tab=vulnerabilities/, { timeout: 5_000 });
        await expect(
            page.locator('a[href^="/vulnerabilities/"]').first(),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('clicking a malware card opens detail with source context', async ({
        page,
    }) => {
        await page.getByRole('button', { name: /^malware$/i }).click();
        await page.waitForURL(/tab=malware/, { timeout: 5_000 });

        const malwareCard = page.locator('a[href^="/malware/"]').first();
        await expect(malwareCard).toBeVisible({ timeout: 10_000 });
        await Promise.all([
            page.waitForURL(/\/malware\/.+fromDomain=cyber-domain/, {
                timeout: 10_000,
            }),
            malwareCard.click({ force: true }),
        ]);

        await expect(page).toHaveURL(/fromTab=malware/);
        await expect(
            page.getByRole('link', { name: /back to malwares/i }),
        ).toBeVisible({ timeout: 15_000 });

        await page.getByRole('link', { name: /back to malwares/i }).click();
        await expect(page).toHaveURL(/\/cyber-domain\?tab=malware/);
        await expect(page.locator('a[href^="/malware/"]').first()).toBeVisible({
            timeout: 10_000,
        });
    });
});
