import { test, expect } from '@playwright/test';

test('should be able to edit a client', async ({ page }, testInfo) => {
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

  // navigate to the clients page
  const nav = page.locator('nav');
  if (testInfo.project.name === 'Mobile Safari' || testInfo.project.name === 'Mobile Chrome') {
    const mobileMenuButton = nav.getByLabel('Open Menu');
    await mobileMenuButton.click();
    const addClientButton = page.getByRole('link', { name: 'View Clients' });
    await addClientButton.click();
  } else {
    const clientsNavLink = nav.getByRole('button', { name: 'Client' });
    await clientsNavLink.click();
    const addClientLink = page.locator('a[href="/view-clients"]');
    await addClientLink.click();
  }

  // click the edit link for the first client in the list
  const editLink = page.locator('tbody a:visible').first();
  await expect(editLink).toBeVisible();
  await editLink.click();

  const nameInput = page.getByLabel('name');
  const updatedClientName = `Updated E2E Test Client ${Date.now()}`;
  await nameInput.fill(updatedClientName);

  // submit the form
  const submitClientButton = page.getByRole('button', { name: 'Save Changes' });
  await submitClientButton.click();

  // search for the new client in the client list
  const searchInput = page.getByPlaceholder('Search by name...');
  await searchInput.fill(updatedClientName);
  const searchButton = page.getByRole('button', { name: 'Search Clients' });
  await searchButton.click();

  // check the new client appears in the list
  const newClientMatches = page.getByRole('cell', { name: updatedClientName });
  await expect(newClientMatches).toBeVisible();
});
