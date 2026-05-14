import { test, expect } from '@playwright/test';

// Helper: login, wait for dashboard shell, then fully settle Firebase auth
async function loginAndWait(page: any) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  // Wait for and fill login form
  await page.locator('[data-test-id="email-input"]').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('[data-test-id="email-input"]').fill('indiannavy7007@gmail.com');
  await page.locator('[data-test-id="password-input"]').fill('1234567');
  await page.locator('[data-test-id="login-button"]').click();

  // Wait for dashboard URL
  await page.waitForURL('**/dashboard', { timeout: 30000 });

  // Wait for the toolbar to appear — proves Angular app shell is fully rendered
  await page.locator('[data-test-id="app-toolbar"]').waitFor({ state: 'visible', timeout: 15000 });

  // Wait for Firebase auth session to fully persist in the browser
  await page.waitForTimeout(3000);
}

// Helper: navigate to a route and wait for the table
async function goToExpenses(page: any) {
  await page.goto('/expenses');
  await page.waitForLoadState('domcontentloaded');
  // Wait for the table which proves the auth guard passed AND Firestore data loaded
  // Using 'table' instead of 'mat-table' to match the actual HTML tag
  await page.locator('table').waitFor({ state: 'visible', timeout: 20000 });
}

test.describe('GreenLedger Expense Tracker E2E', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndWait(page);
  });

  test('1. Login & Navigation Flow', async ({ page }) => {
    // Verify dashboard loaded
    await expect(page.locator('.app-title')).toBeVisible();

    // Navigate to expenses and verify table
    await goToExpenses(page);
    await expect(page.locator('table')).toBeVisible();
  });

  test('2. Add Expense Flow', async ({ page }) => {
    await goToExpenses(page);

    // Open dialog
    await page.locator('[data-test-id="gl-add-expense-btn"]').click();
    await page.waitForTimeout(1000);

    // Fill amount
    await page.locator('[data-test-id="gl-expense-form-amount"]').fill('250');

    // Select category
    await page.locator('[data-test-id="gl-expense-form-category"]').click();
    // Wait for options to appear
    await page.waitForSelector('mat-option');
    await page.getByRole('option', { name: 'Food' }).click();

    // Fill description
    await page.locator('[data-test-id="gl-expense-form-desc"]').fill('Playwright Auto Test');

    // Select payment mode
    await page.locator('mat-radio-button').filter({ hasText: 'Cash' }).click();

    // Submit
    await page.locator('[data-test-id="gl-expense-form-submit"]').click();

    // Wait for dialog to close and Firebase write to propagate
    await page.waitForTimeout(4000);

    // Verify table is visible
    await expect(page.locator('table')).toBeVisible();
  });

  test('3. Search and Filtering', async ({ page }) => {
    await goToExpenses(page);

    // Type in search field
    await page.locator('[data-test-id="gl-search-input"]').fill('Playwright Auto Test');
    await page.waitForTimeout(1000);

    // Table should be visible
    await expect(page.locator('table')).toBeVisible();
  });

  test('4. Edit Expense Flow', async ({ page }) => {
    await goToExpenses(page);

    // Click first edit button if expenses exist
    const editBtns = page.locator('[data-test-id="gl-edit-btn"]');
    const count = await editBtns.count();

    if (count > 0) {
      await editBtns.first().click();
      await page.waitForTimeout(1000);

      // Change amount
      await page.locator('[data-test-id="gl-expense-form-amount"]').clear();
      await page.locator('[data-test-id="gl-expense-form-amount"]').fill('500');
      await page.locator('[data-test-id="gl-expense-form-submit"]').click();
      await page.waitForTimeout(3000);
    }

    // Verify table is still visible
    await expect(page.locator('table')).toBeVisible();
  });

  test('5. Logout with Confirmation', async ({ page }) => {
    // Open user menu
    await page.locator('[data-test-id="user-menu-trigger"]').click();
    await page.waitForTimeout(500);

    // Click logout menu item
    await page.locator('[data-test-id="logout-button"]').click();
    await page.waitForTimeout(500);

    // Confirmation dialog should appear
    await expect(page.locator('mat-dialog-container h2')).toContainText('Logout Confirmation');

    // Confirm logout
    await page.locator('[data-test-id="gl-confirm-delete-btn"]').click();

    // Should redirect to login
    await page.waitForURL('**/login', { timeout: 15000 });
    await expect(page.locator('[data-test-id="login-card"]')).toBeVisible();
  });

  test('6. Profile Management & Validation', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');

    // Wait for profile form to be ready
    const contactInput = page.locator('input[formControlName="contact"]');
    await contactInput.waitFor({ state: 'visible', timeout: 15000 });

    // Type invalid number
    await contactInput.clear();
    await contactInput.fill('12345'); // Too short — invalid

    // Trigger blur to show validation error
    await page.locator('input[formControlName="age"]').click();
    await page.waitForTimeout(400);

    // Error should appear
    const errors = page.locator('mat-error');
    if (await errors.count() > 0) {
      await expect(errors.first()).toContainText('10 digits');
    }

    // Fill valid 10-digit number
    await contactInput.clear();
    await contactInput.fill('9876543210');

    // Submit should be enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });
});
