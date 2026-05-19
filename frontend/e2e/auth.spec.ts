import { expect, test } from '@playwright/test';

// Credentials for the E2E test user created in global-setup.ts
const TEST_EMAIL = 'e2e@cti-platform.test';
const TEST_PASSWORD = 'E2ePassword123!';

// ── Login ──────────────────────────────────────────────────────────────

test.describe('Login page', () => {
    // These tests must run WITHOUT any stored auth state
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('renders login form', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /sign in/i }),
        ).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('shows link to register page', async ({ page }) => {
        await expect(
            page.getByRole('link', {
                name: /register|sign up|create account/i,
            }),
        ).toBeVisible();
    });

    test('shows Google login button', async ({ page }) => {
        await expect(
            page.getByRole('button', { name: /google/i }),
        ).toBeVisible();
    });

    test('login with invalid credentials shows error', async ({ page }) => {
        await page.locator('input[type="email"]').fill('wrong@example.com');
        await page.locator('input[type="password"]').fill('wrongpassword123');
        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(
            page.getByText(/invalid|unauthorized|incorrect|password/i),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('login with valid credentials redirects to home', async ({ page }) => {
        await page.locator('input[type="email"]').fill(TEST_EMAIL);
        await page.locator('input[type="password"]').fill(TEST_PASSWORD);
        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(page).toHaveURL('/', { timeout: 15_000 });
    });

    test('unauthenticated access to protected route redirects to login', async ({
        page,
    }) => {
        await page.goto('/incidents');
        await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
    });
});

// ── Register ───────────────────────────────────────────────────────────

test.describe('Register page', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/register');
    });

    test('renders registration form', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /create account/i }),
        ).toBeVisible();
        await expect(page.locator('input#name')).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('name field is required', async ({ page }) => {
        await page.locator('input[type="email"]').fill('newuser@example.com');
        await page.locator('input[type="password"]').fill('TestPassword123!');
        // Submit without name — browser validation should prevent form submission
        await page.getByRole('button', { name: /create account/i }).click();
        await expect(page).toHaveURL('/register');
    });

    test('shows link to login page', async ({ page }) => {
        await expect(
            page.getByRole('link', { name: /sign in|log in|already/i }),
        ).toBeVisible();
    });
});

// ── Logout ─────────────────────────────────────────────────────────────

test.describe('Logout', () => {
    // Uses global storageState — starts authenticated

    test('user dropdown trigger is visible when authenticated', async ({
        page,
    }) => {
        await page.goto('/');
        await expect(
            page.locator('[data-slot="dropdown-menu-trigger"]'),
        ).toBeVisible({ timeout: 10_000 });
    });

    test('user dropdown shows user name', async ({ page }) => {
        await page.goto('/');
        await page.locator('[data-slot="dropdown-menu-trigger"]').click();
        await expect(page.getByText('E2E Test User')).toBeVisible({
            timeout: 5_000,
        });
    });

    test('logout redirects to login page', async ({ page }) => {
        await page.goto('/');
        await page.locator('[data-slot="dropdown-menu-trigger"]').click();
        await page.getByText(/sign out/i).click();
        await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    });
});
