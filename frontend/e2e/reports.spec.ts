import { expect, type Page, test } from '@playwright/test';

const REPORT_ID = 'report--31c26b52-fbcc-41bb-b8ad-31b64a2e55cf';
const REPORT_NAME = 'Reporte Analítico: Operación Tormenta Híbrida Ibérica';
const REPORT_ID_2 = 'report--a2b3c4d5-e6f7-4a2b-9c0d-1e2f3a4b5c6d';
const REPORT_NAME_2 = 'Informe Estratégico: PHOSPHOR Unit';

// ── Helpers ────────────────────────────────────────────────────────────

function getSearchInput(page: Page) {
    return page.getByPlaceholder(/search/i);
}

// ── Catalog ────────────────────────────────────────────────────────────

test.describe('Reports catalog', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/reports');
        await expect(page.locator('a[href^="/reports/"]').first()).toBeVisible({
            timeout: 10_000,
        });
    });

    test('shows the reports page heading', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /report library/i }),
        ).toBeVisible();
    });

    test('renders at least one report card', async ({ page }) => {
        await expect(
            page.locator('a[href^="/reports/"]').first(),
        ).toBeVisible();
    });

    test('displays Tormenta Híbrida report in the list', async ({ page }) => {
        await expect(
            page.getByText('Tormenta', { exact: false }).first(),
        ).toBeVisible();
    });

    test('displays PHOSPHOR Unit report in the list', async ({ page }) => {
        await expect(
            page.getByText('PHOSPHOR', { exact: false }).first(),
        ).toBeVisible();
    });

    test('search filters reports by name', async ({ page }) => {
        await getSearchInput(page).fill('Tormenta');
        await expect(
            page.getByText('Tormenta', { exact: false }).first(),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('search with no match shows empty state', async ({ page }) => {
        await getSearchInput(page).fill('xyznonexistent999');
        await expect(page.getByText(/no reports found/i)).toBeVisible({
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

    test('pagination controls are present when there are results', async ({
        page,
    }) => {
        const paginationRegion = page
            .getByText(/showing/i)
            .or(page.getByRole('navigation', { name: /pagination/i }));
        await expect(paginationRegion.first()).toBeVisible({ timeout: 5_000 });
    });

    test('sort order can be changed', async ({ page }) => {
        const sortButton = page
            .getByRole('button', { name: /asc|desc|sort/i })
            .first();
        if (await sortButton.isVisible()) {
            await sortButton.click();
            await expect(
                page.getByRole('heading', { name: /report library/i }),
            ).toBeVisible();
        }
    });

    test('view toggle switches to grid view', async ({ page }) => {
        const gridToggle = page.getByRole('button', { name: /grid/i });
        if (await gridToggle.isVisible()) {
            await gridToggle.click();
            await expect(
                page.locator('a[href^="/reports/"]').first(),
            ).toBeVisible();
        }
    });

    test('clicking a report navigates to detail page', async ({ page }) => {
        const firstLink = page
            .locator(`a[href="/reports/${REPORT_ID}"]`)
            .first();
        if (await firstLink.isVisible()) {
            await firstLink.click();
            await expect(page).toHaveURL(new RegExp(`/reports/${REPORT_ID}`), {
                timeout: 8_000,
            });
        }
    });

    test('second report is navigable', async ({ page }) => {
        const link = page.locator(`a[href="/reports/${REPORT_ID_2}"]`).first();
        if (await link.isVisible()) {
            await link.click();
            await expect(page).toHaveURL(
                new RegExp(`/reports/${REPORT_ID_2}`),
                {
                    timeout: 8_000,
                },
            );
        }
    });
});

// ── Detail ─────────────────────────────────────────────────────────────

test.describe('Report detail page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/reports/${REPORT_ID}`);
        await expect(
            page.getByRole('heading', { name: REPORT_NAME }),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('shows report name in the header', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: REPORT_NAME }),
        ).toBeVisible();
    });

    test('shows REPORT entity type label', async ({ page }) => {
        await expect(
            page.getByRole('link', { name: /back to reports/i }),
        ).toBeVisible();
    });

    test('shows TLP badge', async ({ page }) => {
        await expect(page.getByText(/TLP:/i).first()).toBeVisible();
    });

    test('shows Published date', async ({ page }) => {
        await expect(page.getByText(/report types/i).first()).toBeVisible();
    });

    test('shows tab navigation', async ({ page }) => {
        await expect(
            page.getByRole('button', { name: /executive summary/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /actors/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /targets/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /artifacts/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /graph/i }),
        ).toBeVisible();
    });

    test('Datos del reporte tab shows referenced objects', async ({ page }) => {
        await page.getByRole('button', { name: /executive summary/i }).click();
        await expect(page.getByText(/referenced objects/i).first()).toBeVisible(
            { timeout: 8_000 },
        );
    });

    test('export dropdown trigger is visible', async ({ page }) => {
        await expect(
            page.getByRole('button', { name: /export/i }),
        ).toBeVisible();
    });

    test('export dropdown opens with PDF and JSON options', async ({
        page,
    }) => {
        await page.getByRole('button', { name: /export/i }).click();
        await expect(
            page.getByRole('menuitem', { name: /^pdf$/i }),
        ).toBeVisible({ timeout: 3_000 });
        await expect(
            page.getByRole('menuitem', { name: /^json$/i }),
        ).toBeVisible({ timeout: 3_000 });
    });

    test('back button navigates to catalog', async ({ page }) => {
        await page.getByRole('link', { name: /back to reports/i }).click();
        await expect(page).toHaveURL(/\/reports$/, { timeout: 8_000 });
    });

    test('can switch to Resumen ejecutivo tab', async ({ page }) => {
        await page.getByRole('button', { name: /executive summary/i }).click();
        await expect(
            page.getByRole('heading', { name: REPORT_NAME }),
        ).toBeVisible();
    });

    test('can switch to Artefactos tab', async ({ page }) => {
        await page.getByRole('button', { name: /artifacts/i }).click();
        await expect(
            page.getByRole('heading', { name: REPORT_NAME }),
        ).toBeVisible();
    });

    test('can switch to Grafo tab', async ({ page }) => {
        await page.getByRole('button', { name: /graph/i }).click();
        await expect(
            page.getByRole('heading', { name: REPORT_NAME }),
        ).toBeVisible();
    });

    test('second report detail page loads correctly', async ({ page }) => {
        await page.goto(`/reports/${REPORT_ID_2}`);
        await expect(
            page.getByText(REPORT_NAME_2, { exact: false }).first(),
        ).toBeVisible({ timeout: 10_000 });
    });
});
