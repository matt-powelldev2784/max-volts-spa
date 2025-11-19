import { test, expect } from '@playwright/test';

test('should be able to add a client', async ({ page }, testInfo) => {
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

  // navigate to the Clients page
  const nav = page.locator('nav');
  if (testInfo.project.name === 'Mobile Safari' || testInfo.project.name === 'Mobile Chrome') {
    const mobileMenuButton = nav.getByLabel('Open Menu');
    await mobileMenuButton.click();
    const addClientButton = page.getByRole('link', { name: 'Add Client' });
    await addClientButton.click();
  } else {
    const clientsNavLink = nav.getByRole('button', { name: 'Client' });
    await clientsNavLink.click();
    const addClientLink = page.locator('a[href="/add-client"]');
    await addClientLink.click();
  }

  // fill out the add client form
  const newClientName = `__Test Suite Client ${Date.now()}`;

  const nameInput = page.getByLabel('name');
  await nameInput.fill(newClientName);
  const companyInput = page.getByLabel('company');
  await companyInput.fill('E2E Test Company');
  const emailClientInput = page.getByLabel('email');
  await emailClientInput.fill('test@test.com');
  const telephoneInput = page.getByLabel('telephone');
  await telephoneInput.fill('1234567890');
  const address1Input = page.getByLabel('Address Line 1');
  await address1Input.fill('123 Test Street');
  const address2Input = page.getByLabel('Address Line 2');
  await address2Input.fill('Flat 101');
  const cityInput = page.getByLabel('city');
  await cityInput.fill('Test City');
  const countyInput = page.getByLabel('county');
  await countyInput.fill('Surrey');
  const postcodeInput = page.getByLabel('Post Code');
  await postcodeInput.fill('SW1 1AA');

  // submit the form
  const submitClientButton = page.getByRole('button', { name: 'Add Client' });
  await submitClientButton.click();

  // search for the new client in the client list
  const searchInput = page.getByPlaceholder('Search by name...');
  await searchInput.fill(newClientName);
  const searchButton = page.getByRole('button', { name: 'Search Clients' });
  await searchButton.click();

  // check the new client appears in the list
  const newClientMatches = page.getByRole('cell', { name: newClientName });
  await expect(newClientMatches).toBeVisible();
});
