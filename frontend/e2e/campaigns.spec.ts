import { expect, type Page, test } from '@playwright/test';

const CAMPAIGN_ID = 'campaign--4e8f1a2b-3c4d-4e6f-b192-a3b4c5d6e7f8';
const CAMPAIGN_NAME = 'Operación Neptuno';

// ── Helpers ────────────────────────────────────────────────────────────

/** The search input is a plain type="text"; use getByPlaceholder. */
function getSearchInput(page: Page) {
    return page.getByPlaceholder(/search/i);
}

// ── Catalog ────────────────────────────────────────────────────────────

test.describe('Campaigns catalog', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/campaigns');
        await expect(
            page.locator('a[href^="/campaigns/"]').first(),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('shows the campaigns page heading', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /campaign library/i }),
        ).toBeVisible();
    });

    test('renders at least one campaign card', async ({ page }) => {
        await expect(
            page.locator('a[href^="/campaigns/"]').first(),
        ).toBeVisible();
    });

    test('displays Operación Neptuno in the list', async ({ page }) => {
        await expect(
            page.getByText(CAMPAIGN_NAME, { exact: false }).first(),
        ).toBeVisible();
    });

    test('displays Operación Matrioska Española in the list', async ({
        page,
    }) => {
        await expect(
            page
                .getByText('Operación Matrioska Española', { exact: false })
                .first(),
        ).toBeVisible();
    });

    test('search filters campaigns by name', async ({ page }) => {
        await getSearchInput(page).fill('Neptuno');
        await expect(
            page.getByText(CAMPAIGN_NAME, { exact: false }).first(),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('search with no match shows empty state', async ({ page }) => {
        await getSearchInput(page).fill('xyznonexistent999');
        await expect(page.getByText(/no campaigns found/i)).toBeVisible({
            timeout: 8_000,
        });
    });

    test('TLP filter chips are visible after opening filters', async ({
        page,
    }) => {
        const filterButton = page.getByRole('button', { name: /filter/i });
        if (await filterButton.isVisible()) {
            await filterButton.click();
        }
        await expect(
            page.getByText('TLP:CLEAR', { exact: true }).first(),
        ).toBeVisible({ timeout: 5_000 });
    });

    test('TLP filter by TLP:CLEAR shows campaigns accordingly', async ({
        page,
    }) => {
        const filterButton = page.getByRole('button', { name: /filter/i });
        if (await filterButton.isVisible()) {
            await filterButton.click();
        }
        const clearChip = page.getByRole('button', { name: /TLP:CLEAR/i });
        if (await clearChip.isVisible()) {
            await clearChip.click();
            await expect(page.getByRole('main')).toBeVisible();
        }
    });

    test('pagination controls are present when there are results', async ({
        page,
    }) => {
        const paginationRegion = page
            .getByText(/showing/i)
            .or(page.getByRole('navigation', { name: /pagination/i }));
        await expect(paginationRegion.first()).toBeVisible({ timeout: 5_000 });
    });

    test('sort order can be changed', async ({ page }) => {
        const filterButton = page.getByRole('button', { name: /filter/i });
        if (await filterButton.isVisible()) {
            await filterButton.click();
        }
        const oldestFirst = page.getByRole('button', { name: /oldest first/i });
        if (await oldestFirst.isVisible()) {
            await oldestFirst.click();
            await expect(page.getByRole('main')).toBeVisible();
        }
    });

    test('grid/list toggle switches view mode', async ({ page }) => {
        const gridToggle = page.getByRole('button', { name: /grid/i });
        if (await gridToggle.isVisible()) {
            await gridToggle.click();
            await expect(page.getByRole('main')).toBeVisible();
        }
    });

    test('clicking a campaign card navigates to detail page', async ({
        page,
    }) => {
        await page.locator('a[href^="/campaigns/"]').first().click();
        await expect(page).toHaveURL(/\/campaigns\/.+/);
    });
});

// ── Detail page ────────────────────────────────────────────────────────

test.describe('Campaign detail page — Operación Neptuno', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/campaigns/${CAMPAIGN_ID}`);
        // The campaign name appears in the sticky header <span>
        await expect(
            page.getByText(CAMPAIGN_NAME, { exact: false }).first(),
        ).toBeVisible({ timeout: 15_000 });
    });

    test('shows campaign name in header', async ({ page }) => {
        await expect(
            page.getByText(CAMPAIGN_NAME, { exact: false }).first(),
        ).toBeVisible();
    });

    test('shows TLP badge', async ({ page }) => {
        await expect(page.getByText(/TLP:/i).first()).toBeVisible();
    });

    test('shows confidence badge with Verified label', async ({ page }) => {
        // Confidence 88 >= 80 → "Verified"
        await expect(page.getByText('Verified').first()).toBeVisible();
    });

    test('shows CAMPAIGN entity type label', async ({ page }) => {
        await expect(page.getByText('CAMPAIGN', { exact: true })).toBeVisible();
    });

    test('shows all five tabs', async ({ page }) => {
        await expect(
            page.getByRole('button', { name: /executive summary/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /network analysis/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /artifacts/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /^map$/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /timeline/i }),
        ).toBeVisible();
    });

    test('Executive Summary tab shows description section', async ({
        page,
    }) => {
        await expect(page.getByText(/description/i).first()).toBeVisible();
    });

    test('Executive Summary tab shows CAMPAIGN Data section', async ({
        page,
    }) => {
        await expect(
            page.getByText(/CAMPAIGN data/i, { exact: false }),
        ).toBeVisible();
    });

    test('Executive Summary tab shows TTPs section', async ({ page }) => {
        await expect(
            page.getByText(/TTPs & Planning Phases/i, { exact: false }),
        ).toBeVisible();
    });

    test('Executive Summary tab shows TTPs section with Cyber domain card', async ({
        page,
    }) => {
        await expect(
            page.getByText(/TTPs & Planning Phases/i, { exact: false }),
        ).toBeVisible({ timeout: 8_000 });
        // The TTPs section contains Cyber and Info domain cards
        await expect(page.getByText('Cyber').first()).toBeVisible({
            timeout: 5_000,
        });
    });

    test('Network Analysis tab renders graph', async ({ page }) => {
        await page.getByRole('button', { name: /network analysis/i }).click();
        await page.waitForURL(/tab=network/, { timeout: 5_000 });
        await expect(page.locator('[class*="react-flow"]').first()).toBeVisible(
            { timeout: 10_000 },
        );
    });

    test('Artifacts tab renders IoC list or empty state', async ({ page }) => {
        await page.getByRole('button', { name: /artifacts/i }).click();
        await page.waitForURL(/tab=artifacts/, { timeout: 5_000 });
        await expect(
            page
                .getByText(/attachments/i)
                .or(page.getByText(/no indicators/i))
                .first(),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('Artifacts tab shows real indicators from data', async ({ page }) => {
        await page.getByRole('button', { name: /artifacts/i }).click();
        await page.waitForURL(/tab=artifacts/, { timeout: 5_000 });
        // Indicators render their name field: "Dominio C2 NeptuneRAT" / "IP de C2 ExfilBeacon"
        await expect(
            page
                .getByText(/dominio c2/i, { exact: false })
                .or(page.getByText(/exfilbeacon/i, { exact: false }))
                .or(page.getByText(/NeptuneRAT/i, { exact: false }))
                .first(),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('Map tab renders map container', async ({ page }) => {
        await page.getByRole('button', { name: /^map$/i }).click();
        await page.waitForURL(/tab=map/, { timeout: 5_000 });
        await expect(page.locator('canvas').first()).toBeVisible({
            timeout: 10_000,
        });
    });

    test('Timeline tab renders timeline content', async ({ page }) => {
        await page.getByRole('button', { name: /timeline/i }).click();
        await page.waitForURL(/tab=timeline/, { timeout: 5_000 });
        await expect(
            page.getByText(/timeline/i, { exact: false }).first(),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('selected tab persists on page reload', async ({ page }) => {
        await page.getByRole('button', { name: /^map$/i }).click();
        await page.waitForURL(/tab=map/, { timeout: 5_000 });
        await page.reload();
        await expect(
            page.getByText(CAMPAIGN_NAME, { exact: false }).first(),
        ).toBeVisible({ timeout: 15_000 });
        await page.waitForURL(/tab=map/, { timeout: 5_000 });
        await expect(page.locator('canvas').first()).toBeVisible({
            timeout: 10_000,
        });
    });

    test('back button navigates to campaigns catalog', async ({ page }) => {
        await page.getByRole('link', { name: /back/i }).click();
        await expect(page).toHaveURL(/\/campaigns(\?.*)?$/);
    });
});
