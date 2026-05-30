import { expect, test } from '@playwright/test';

/**
 * US1 Independent Test: register, create a challenge, add a book with a reason,
 * reload, and confirm the challenge still shows its linked book and reason.
 *
 * Prerequisite: backend API running on :3000 and frontend on :5173.
 */
test('connect a challenge to a book with intent (persists after reload)', async ({ page }) => {
  const email = `e2e_${Date.now()}@example.com`;

  await page.goto('/');

  // Register a new account.
  await page.getByRole('button', { name: 'Register' }).first().click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/Password/).fill('password123');
  await page.getByRole('button', { name: 'Register' }).click();

  // Create a challenge.
  await page.getByLabel(/What challenge/).fill('Manage my time better');
  await page.getByRole('button', { name: 'Add challenge' }).click();

  // Open it and add a book with a reason.
  await page.getByRole('link', { name: 'Manage my time better' }).click();
  await page.getByLabel('Book title').fill('Getting Things Done');
  await page.getByLabel('Author').fill('David Allen');
  await page.getByLabel(/Why did you decide/).fill('My task list overwhelms me');
  await page.getByRole('button', { name: 'Add book' }).click();

  await expect(page.getByText('Getting Things Done')).toBeVisible();

  // Reload and confirm persistence.
  await page.reload();
  await expect(page.getByText('Getting Things Done')).toBeVisible();
  await expect(page.getByText('My task list overwhelms me')).toBeVisible();
});
