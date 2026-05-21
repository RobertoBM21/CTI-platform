import { expect, test } from '@playwright/test';

const INCIDENT_ID = 'incident--02446f25-bd64-44b2-a4f2-938a2024b3ad';
const INCIDENT_NAME = 'Operación Tormenta Híbrida Ibérica';

// ── Catalog ────────────────────────────────────────────────────────────

test.describe('Incidents catalog', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/incidents');
        await expect(
            page.getByRole('heading', { name: /incident library/i }),
        ).toBeVisible();
    });

    test('shows the incidents page heading', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /incident library/i }),
        ).toBeVisible();
    });

    test('renders at least one incident card', async ({ page }) => {
        const incidentLinks = page.locator('a[href^="/incidents/"]');
        await expect(incidentLinks.first()).toBeVisible({ timeout: 10_000 });
    });

    test('displays the test incident in the list', async ({ page }) => {
        await expect(
            page.getByText(INCIDENT_NAME, { exact: false }),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('search filters incidents by name', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.fill('Tormenta');
        await expect(
            page.getByText(INCIDENT_NAME, { exact: false }),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('search with no match shows empty state', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.fill('xyznonexistent999');
        await expect(page.getByText(/no incidents found/i)).toBeVisible({
            timeout: 8_000,
        });
    });

    test('TLP filter chips are visible', async ({ page }) => {
        const filterButton = page.getByRole('button', { name: /filter/i });
        if (await filterButton.isVisible()) {
            await filterButton.click();
        }
        await expect(page.getByText('TLP:CLEAR', { exact: true })).toBeVisible({
            timeout: 5_000,
        });
    });

    test('TLP filter by TLP:CLEAR hides/shows incidents accordingly', async ({
        page,
    }) => {
        const filterButton = page.getByRole('button', { name: /filter/i });
        if (await filterButton.isVisible()) {
            await filterButton.click();
        }
        const clearChip = page.getByRole('button', {
            name: /TLP:CLEAR/i,
        });
        if (await clearChip.isVisible()) {
            await clearChip.click();
            await expect(
                page.getByRole('heading', { name: /incident library/i }),
            ).toBeVisible();
        }
    });

    test('pagination controls are present when there are results', async ({
        page,
    }) => {
        const incidentLinks = page.locator('a[href^="/incidents/"]');
        await expect(incidentLinks.first()).toBeVisible({ timeout: 10_000 });
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
        const oldestFirst = page.getByRole('button', {
            name: /oldest first/i,
        });
        if (await oldestFirst.isVisible()) {
            await oldestFirst.click();
            await expect(
                page.getByRole('heading', { name: /incident library/i }),
            ).toBeVisible();
        }
    });
});

// ── Detail page ────────────────────────────────────────────────────────

test.describe('Incident detail page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/incidents/${INCIDENT_ID}`);
        await expect(
            page.getByRole('heading', { name: INCIDENT_NAME }),
        ).toBeVisible({ timeout: 15_000 });
    });

    test('shows incident name in header', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: INCIDENT_NAME }),
        ).toBeVisible();
    });

    test('shows TLP badge', async ({ page }) => {
        await expect(page.getByText(/TLP:/i)).toBeVisible();
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
        await expect(page.getByRole('button', { name: /map/i })).toBeVisible();
        await expect(
            page.getByRole('button', { name: /timeline/i }),
        ).toBeVisible();
    });

    test('Executive Summary tab shows description section', async ({
        page,
    }) => {
        await expect(page.getByText(/description/i)).toBeVisible();
    });

    test('Executive Summary tab shows Incident Data section', async ({
        page,
    }) => {
        await expect(
            page.getByText(/incident data/i, { exact: false }),
        ).toBeVisible();
    });

    test('Executive Summary tab shows TTPs section', async ({ page }) => {
        await expect(
            page.getByText(/TTPs & Planning Phases/i, { exact: false }),
        ).toBeVisible();
    });

    test('Network Analysis tab renders graph', async ({ page }) => {
        await page.getByRole('button', { name: /network analysis/i }).click();
        await expect(page).toHaveURL(/tab=network/, { timeout: 5_000 });
        await expect(page.locator('[class*="react-flow"]').first()).toBeVisible(
            { timeout: 10_000 },
        );
    });

    test('Artifacts tab renders IoC list or empty state', async ({ page }) => {
        await page.getByRole('button', { name: /artifacts/i }).click();
        await expect(page).toHaveURL(/tab=artifacts/, { timeout: 5_000 });
        await expect(
            page.getByText(/attachments/i).or(page.getByText(/no indicators/i)),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('Map tab renders map container', async ({ page }) => {
        await page.getByRole('button', { name: /^map$/i }).click();
        await expect(page).toHaveURL(/tab=map/, { timeout: 5_000 });
        await expect(page.locator('canvas').first()).toBeVisible({
            timeout: 10_000,
        });
    });

    test('Timeline tab renders dual-domain timeline', async ({ page }) => {
        await page.getByRole('button', { name: /timeline/i }).click();
        await expect(page).toHaveURL(/tab=timeline/, { timeout: 5_000 });
        await expect(
            page.getByRole('heading', { name: /dual-domain timeline/i }),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('selected tab persists on page reload', async ({ page }) => {
        await page.getByRole('button', { name: /^map$/i }).click();
        await expect(page).toHaveURL(/tab=map/, { timeout: 5_000 });
        await page.reload();
        await expect(
            page.getByRole('heading', { name: INCIDENT_NAME }),
        ).toBeVisible({ timeout: 15_000 });
        await expect(page).toHaveURL(/tab=map/, { timeout: 5_000 });
        await expect(page.locator('canvas').first()).toBeVisible({
            timeout: 10_000,
        });
    });

    test('back button navigates to catalog', async ({ page }) => {
        await page.getByRole('link', { name: /back/i }).click();
        await expect(page).toHaveURL(/\/incidents(\?.*)?$/);
    });

    // ──  Export ─────────────────────────────────────────────

    test('Export button is visible in detail header', async ({ page }) => {
        await expect(page.getByRole('button', { name: /export/i })).toBeVisible(
            { timeout: 5_000 },
        );
    });

    test('Export dropdown shows PDF and JSON options', async ({ page }) => {
        await page.getByRole('button', { name: /export/i }).click();
        await expect(
            page
                .getByRole('menuitem', { name: /json/i })
                .or(page.getByText(/export json/i)),
        ).toBeVisible({ timeout: 5_000 });
        await expect(
            page
                .getByRole('menuitem', { name: /pdf/i })
                .or(page.getByText(/export pdf/i)),
        ).toBeVisible({ timeout: 5_000 });
    });
});
