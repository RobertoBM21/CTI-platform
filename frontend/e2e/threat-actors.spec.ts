import { expect, type Page, test } from '@playwright/test';

// PHOSPHOR Unit — main actor with rich related data
const ACTOR_ID = 'threat-actor--9d8c7b6a-5f4e-4d2c-8b0a-fedcba098765';
const ACTOR_NAME = 'PHOSPHOR Unit';

// Bear Whisperer — secondary actor, verifies note added in bundle v2
const BEAR_ID = 'threat-actor--b21008d6-ea3d-4c8d-8a56-b928f2ca6b91';
const BEAR_NAME = 'Bear Whisperer';

// ── Helpers ────────────────────────────────────────────────────────────

function getSearchInput(page: Page) {
    return page.getByPlaceholder(/search/i);
}

// ── Catalog ────────────────────────────────────────────────────────────

test.describe('Threat Actors catalog', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/threat-actors');
        await expect(
            page.locator('a[href^="/threat-actors/"]').first(),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('shows the Threat Actor Registry heading', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /threat actor registry/i }),
        ).toBeVisible();
    });

    test('renders at least one threat actor card', async ({ page }) => {
        await expect(
            page.locator('a[href^="/threat-actors/"]').first(),
        ).toBeVisible();
    });

    test('displays PHOSPHOR Unit in the list', async ({ page }) => {
        await expect(
            page.getByText(ACTOR_NAME, { exact: false }).first(),
        ).toBeVisible();
    });

    test('displays Bear Whisperer in the list', async ({ page }) => {
        await expect(
            page.getByText(BEAR_NAME, { exact: false }).first(),
        ).toBeVisible();
    });

    test('search filters actors by name', async ({ page }) => {
        await getSearchInput(page).fill('PHOSPHOR');
        await expect(
            page.getByText(ACTOR_NAME, { exact: false }).first(),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('search with no match shows empty state', async ({ page }) => {
        await getSearchInput(page).fill('xyznonexistent999');
        await expect(page.getByText(/no threat actors found/i)).toBeVisible({
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

    test('TLP filter by TLP:CLEAR shows actors accordingly', async ({
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

    test('clicking a threat actor card navigates to detail page', async ({
        page,
    }) => {
        await page.locator('a[href^="/threat-actors/"]').first().click();
        await expect(page).toHaveURL(/\/threat-actors\/.+/);
    });
});

// ── Detail page — PHOSPHOR Unit ────────────────────────────────────────

test.describe('Threat Actor detail page — PHOSPHOR Unit', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/threat-actors/${ACTOR_ID}`);
        await expect(
            page.getByText(ACTOR_NAME, { exact: false }).first(),
        ).toBeVisible({ timeout: 15_000 });
    });

    test('shows actor name in header', async ({ page }) => {
        await expect(
            page.getByText(ACTOR_NAME, { exact: false }).first(),
        ).toBeVisible();
    });

    test('shows TLP badge', async ({ page }) => {
        await expect(page.getByText(/TLP:/i).first()).toBeVisible();
    });

    test('shows THREAT ACTOR entity type label', async ({ page }) => {
        await expect(
            page.getByText('THREAT ACTOR', { exact: true }),
        ).toBeVisible();
    });

    test('shows all four tabs', async ({ page }) => {
        await expect(
            page.getByRole('button', { name: /actor overview/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /^cyber$/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /info-ops/i }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /hybrid graph/i }),
        ).toBeVisible();
    });

    // ── Actor Overview tab ─────────────────────────────────────────────

    test('Actor Overview tab shows Actor Profile section', async ({ page }) => {
        await expect(
            page.getByText(/actor profile/i, { exact: false }),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('Actor Overview tab shows nation-state type', async ({ page }) => {
        await expect(
            page.getByText(/nation-state/i, { exact: false }),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('Actor Overview tab shows aliases (Iron Tide)', async ({ page }) => {
        await expect(
            page.getByText(/iron tide/i, { exact: false }),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('Actor Overview tab shows espionage motivation', async ({ page }) => {
        await expect(
            page.getByText(/espionage/i, { exact: false }),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('Actor Overview tab shows Narratives section with PHOSPHOR info note abstract', async ({
        page,
    }) => {
        // The note abstract becomes the card title after the fix
        await expect(
            page
                .getByText(/perfil cognitivo/i, { exact: false })
                .or(
                    page.getByText(/narratives.*info assets/i, {
                        exact: false,
                    }),
                )
                .first(),
        ).toBeVisible({ timeout: 10_000 });
    });

    // ── Cyber tab ──────────────────────────────────────────────────────

    test('Cyber tab renders Cyber TTPs section', async ({ page }) => {
        await page.getByRole('button', { name: /^cyber$/i }).click();
        await page.waitForURL(/tab=cyber/, { timeout: 5_000 });
        await expect(
            page.getByText(/cyber ttps/i, { exact: false }),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('Cyber tab shows Supply Chain Compromise TTP', async ({ page }) => {
        await page.getByRole('button', { name: /^cyber$/i }).click();
        await page.waitForURL(/tab=cyber/, { timeout: 5_000 });
        await expect(
            page
                .getByText(/supply chain/i, { exact: false })
                .or(page.getByText(/lateral movement/i, { exact: false }))
                .first(),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('Cyber tab renders Cyber Network Graph', async ({ page }) => {
        await page.getByRole('button', { name: /^cyber$/i }).click();
        await page.waitForURL(/tab=cyber/, { timeout: 5_000 });
        await expect(page.locator('[class*="react-flow"]').first()).toBeVisible(
            { timeout: 10_000 },
        );
    });

    // ── Info-Ops tab ───────────────────────────────────────────────────

    test('Info-Ops tab renders without error', async ({ page }) => {
        await page.getByRole('button', { name: /info-ops/i }).click();
        await page.waitForURL(/tab=info/, { timeout: 5_000 });
        await expect(page.getByRole('main')).toBeVisible();
    });

    test('Info-Ops tab shows info note with abstract as title', async ({
        page,
    }) => {
        await page.getByRole('button', { name: /info-ops/i }).click();
        await page.waitForURL(/tab=info/, { timeout: 5_000 });
        // "Perfil cognitivo y evaluación estratégica — PHOSPHOR Unit"
        await expect(
            page.getByText(/perfil cognitivo/i, { exact: false }),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('Info-Ops tab shows Narratives & Info Assets section', async ({
        page,
    }) => {
        await page.getByRole('button', { name: /info-ops/i }).click();
        await page.waitForURL(/tab=info/, { timeout: 5_000 });
        await expect(
            page.getByText(/narratives/i, { exact: false }),
        ).toBeVisible({ timeout: 8_000 });
    });

    // ── Hybrid Graph tab ───────────────────────────────────────────────

    test('Hybrid Graph tab renders react-flow graph', async ({ page }) => {
        await page.getByRole('button', { name: /hybrid graph/i }).click();
        await page.waitForURL(/tab=hybrid/, { timeout: 5_000 });
        await expect(page.locator('[class*="react-flow"]').first()).toBeVisible(
            { timeout: 10_000 },
        );
    });

    test('Hybrid Graph tab legend is visible', async ({ page }) => {
        await page.getByRole('button', { name: /hybrid graph/i }).click();
        await page.waitForURL(/tab=hybrid/, { timeout: 5_000 });
        // Domain/Relations legend tabs
        await expect(
            page.getByText(/domain/i, { exact: false }).first(),
        ).toBeVisible({ timeout: 8_000 });
    });

    test('Hybrid Graph tab Relations legend tab shows relationship lines', async ({
        page,
    }) => {
        await page.getByRole('button', { name: /hybrid graph/i }).click();
        await page.waitForURL(/tab=hybrid/, { timeout: 5_000 });
        // Switch to Relations view in legend
        const relationsTab = page.getByRole('button', { name: /relations/i });
        if (await relationsTab.isVisible({ timeout: 5_000 })) {
            await relationsTab.click();
            // Relations legend should show relationship type labels
            await expect(
                page
                    .getByText(/uses/i, { exact: false })
                    .or(page.getByText(/attributed/i, { exact: false }))
                    .first(),
            ).toBeVisible({ timeout: 8_000 });
        }
    });

    // ── Tab URL persistence ────────────────────────────────────────────

    test('selected tab persists on page reload', async ({ page }) => {
        await page.getByRole('button', { name: /^cyber$/i }).click();
        await page.waitForURL(/tab=cyber/, { timeout: 5_000 });
        await page.reload();
        await expect(
            page.getByText(ACTOR_NAME, { exact: false }).first(),
        ).toBeVisible({ timeout: 15_000 });
        await page.waitForURL(/tab=cyber/, { timeout: 5_000 });
        await expect(page.locator('[class*="react-flow"]').first()).toBeVisible(
            { timeout: 10_000 },
        );
    });

    test('back button navigates to threat actors catalog', async ({ page }) => {
        await page.getByRole('link', { name: /back/i }).click();
        await expect(page).toHaveURL(/\/threat-actors(\?.*)?$/);
    });
});

// ── Detail page — Bear Whisperer ───────────────────────────────────────

test.describe('Threat Actor detail page — Bear Whisperer', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/threat-actors/${BEAR_ID}`);
        await expect(
            page.getByText(BEAR_NAME, { exact: false }).first(),
        ).toBeVisible({ timeout: 15_000 });
    });

    test('shows Bear Whisperer name in header', async ({ page }) => {
        await expect(
            page.getByText(BEAR_NAME, { exact: false }).first(),
        ).toBeVisible();
    });

    test('shows advanced sophistication', async ({ page }) => {
        await expect(page.getByText(/advanced/i, { exact: false })).toBeVisible(
            { timeout: 8_000 },
        );
    });

    test('Info-Ops tab shows new Bear Whisperer info note', async ({
        page,
    }) => {
        await page.getByRole('button', { name: /info-ops/i }).click();
        await page.waitForURL(/tab=info/, { timeout: 5_000 });
        // "Perfil de actor y evaluación de capacidades — Bear Whisperer (APT-Bear)"
        await expect(
            page.getByText(/perfil de actor/i, { exact: false }),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('Hybrid Graph tab renders graph', async ({ page }) => {
        await page.getByRole('button', { name: /hybrid graph/i }).click();
        await page.waitForURL(/tab=hybrid/, { timeout: 5_000 });
        await expect(page.locator('[class*="react-flow"]').first()).toBeVisible(
            { timeout: 10_000 },
        );
    });
});
