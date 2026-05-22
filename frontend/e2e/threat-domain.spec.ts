import { expect, test } from '@playwright/test';

// ── Threat Domain catalog ──────────────────────────────────────────────

test.describe('Threat Domain catalog', () => {
    function getTabButton(
        page: import('@playwright/test').Page,
        label: string,
    ) {
        return page.locator('nav button').filter({ hasText: label }).first();
    }

    test.beforeEach(async ({ page }) => {
        await page.goto('/threat-domain');
        await expect(
            page.getByRole('heading', { name: /threat domain/i }),
        ).toBeVisible();
    });

    test('shows Threat Domain heading', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /threat domain/i }),
        ).toBeVisible();
    });

    test('shows All tab', async ({ page }) => {
        await expect(getTabButton(page, 'All')).toBeVisible({
            timeout: 5_000,
        });
    });

    test('shows Incidents tab', async ({ page }) => {
        await expect(getTabButton(page, 'Incidents')).toBeVisible();
    });

    test('shows Campaigns tab', async ({ page }) => {
        await expect(getTabButton(page, 'Campaigns')).toBeVisible();
    });

    test('shows Threat Actors tab', async ({ page }) => {
        await expect(getTabButton(page, 'Threat Actors')).toBeVisible();
    });

    test('shows Attack Patterns tab', async ({ page }) => {
        await expect(getTabButton(page, 'Attack Patterns')).toBeVisible();
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
        await getTabButton(page, 'Incidents').click();
        await expect(
            page.locator('a[href^="/incidents/"]').first(),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('Campaigns tab shows campaigns', async ({ page }) => {
        await getTabButton(page, 'Campaigns').click();
        await expect(
            page.locator('a[href^="/campaigns/"]').first(),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('Campaigns intrusion set filter is enabled and selectable', async ({
        page,
    }) => {
        await getTabButton(page, 'Campaigns').click();
        await page.getByRole('button', { name: /filters/i }).click();

        const trigger = page
            .locator('p', { hasText: 'Intrusion Set' })
            .first()
            .locator(
                'xpath=following-sibling::button[@data-slot="dropdown-menu-trigger"][1]',
            );
        await expect(trigger).toBeVisible();
        await expect(trigger).toBeEnabled({ timeout: 10_000 });
        await expect(trigger).not.toContainText(/no intrusion sets available/i);
        await expect(trigger).toContainText(/choose an intrusion set/i);

        await trigger.click();
        await expect(
            page.getByRole('menuitem', { name: /all intrusion sets/i }),
        ).toHaveCount(0);
        const firstOption = page
            .getByRole('menuitem')
            .filter({ hasText: /^(?!Choose an intrusion set$).+/ })
            .first();
        await expect(firstOption).toBeVisible();

        const filteredCampaignsRequest = page.waitForResponse(
            (response) => {
                if (!response.url().includes('/api/campaigns')) return false;
                if (response.request().method() !== 'GET') return false;

                const url = new URL(response.url());
                const intrusionSetId = url.searchParams.get('intrusionSetId');

                return (
                    Boolean(intrusionSetId && intrusionSetId.length > 0) &&
                    response.ok()
                );
            },
            { timeout: 10_000 },
        );

        await firstOption.click();
        await filteredCampaignsRequest;

        await expect(trigger).not.toContainText(/choose an intrusion set/i);
    });

    test('Threat Actors tab shows threat actors', async ({ page }) => {
        await getTabButton(page, 'Threat Actors').click();
        await expect(
            page.locator('a[href^="/threat-actors/"]').first(),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('Attack Patterns tab shows a table', async ({ page }) => {
        await getTabButton(page, 'Attack Patterns').click();
        await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 });
    });

    test('search input is visible', async ({ page }) => {
        await getTabButton(page, 'Attack Patterns').click();
        await expect(
            page.getByPlaceholder('Search attack patterns...'),
        ).toBeVisible({
            timeout: 5_000,
        });
    });

    test('sidebar link navigates to threat domain', async ({ page }) => {
        await page.goto('/');
        const link = page.locator('aside nav a[href="/threat-domain"]').first();
        await expect(link).toBeVisible({ timeout: 10_000 });
        await Promise.all([
            page.waitForURL(/\/threat-domain/, { timeout: 10_000 }),
            link.click({ force: true }),
        ]);
    });
});
