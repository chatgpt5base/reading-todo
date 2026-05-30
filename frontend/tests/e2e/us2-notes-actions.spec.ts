import { expect, test } from '@playwright/test';

/**
 * US2 (minimum) end-to-end: register, create a challenge, add a book, write a note,
 * and convert the note into an action — proving the reading-to-action value chain.
 *
 * Prerequisite: backend API running on :3000 and frontend on :5173.
 */
test('convert a reading note into an action', async ({ page }) => {
  const email = `e2e2_${Date.now()}@example.com`;

  await page.goto('/');
  await page.getByRole('button', { name: 'Register' }).first().click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/Password/).fill('password123');
  await page.getByRole('button', { name: 'Register' }).click();

  // Challenge + book.
  await page.getByLabel(/What challenge/).fill('Build better habits');
  await page.getByRole('button', { name: 'Add challenge' }).click();
  await page.getByRole('link', { name: 'Build better habits' }).click();
  await page.getByLabel('Book title').fill('Atomic Habits');
  await page.getByLabel('Author').fill('James Clear');
  await page.getByRole('button', { name: 'Add book' }).click();

  // Open the book, add a note.
  await page.getByRole('link', { name: 'Atomic Habits' }).click();
  await page.getByLabel(/What did you learn/).fill('Habit stacking links a new habit to an old one');
  await page.getByRole('button', { name: 'Add note' }).click();

  // Convert the note into an action.
  await page.getByLabel('Action description').fill('Do 10 pushups after morning coffee');
  await page.getByLabel('Cadence').selectOption('daily');
  await page.getByRole('button', { name: 'Create action' }).click();

  await expect(page.getByText('Do 10 pushups after morning coffee')).toBeVisible();

  // Traceability preserved after reload: the note and its derived action persist
  // on the same book detail page (Challenge -> Book -> Note -> Action).
  await page.reload();
  await expect(page.getByText('Habit stacking links a new habit to an old one')).toBeVisible();
  await expect(page.getByText('Do 10 pushups after morning coffee')).toBeVisible();
  await expect(page.getByText('(Daily)')).toBeVisible();
});
