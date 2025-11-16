import { test, expect } from '@playwright/test';

test('should be able to sign in with email and password', async ({ page }) => {
  await page.goto('/');

  // click the sign in button
  const signInWithEmailButton = page.getByRole('button', { name: 'Sign in with Email' });
  await signInWithEmailButton.click();

  // fill out the email and password form and click submit
  const emailInput = page.getByLabel('Email');
  await emailInput.fill('maxvoltsspa@gmail.com');
  const passwordInput = page.getByLabel('Password');
  await passwordInput.fill('Digital123$');
  const submitButton = page.getByRole('button', { name: /^Sign In$/ });
  await submitButton.click();

  // verify that we are signed in by checking for the presence of the Quote List text
  const quoteListText = page.getByText('Quote List');
  await expect(quoteListText).toBeVisible();
});

