import { test, expect } from '@playwright/test';

// add a client first, then add a quote for that client
// this is to allow the test to assert than an actual quote is created for the new client

test('should be able to add a quote', async ({ page }, testInfo) => {
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

  // navigate to the add quote page
  if (testInfo.project.name === 'Mobile Safari' || testInfo.project.name === 'Mobile Chrome') {
    const mobileMenuButton = nav.getByLabel('Open Menu');
    await mobileMenuButton.click();
    const addQuoteMenuItem = page.locator('[data-slot="dropdown-menu-item"]', { hasText: 'Add Quote' });
    await addQuoteMenuItem.click();
  } else {
    const quotesNavLink = nav.getByRole('button', { name: 'Quote' });
    await quotesNavLink.click();
    const addQuoteMenuItem = page.locator('[data-slot="dropdown-menu-item"]', { hasText: 'Add Quote' });
    await addQuoteMenuItem.click();
  }

  // select a client for the quote
  const clientSelect = page.getByRole('combobox', { name: 'Client *' });
  await clientSelect.click();
  const clientOption = page.locator('div[role="option"]', { hasText: newClientName });
  await clientOption.click();
  const nextButton = page.getByRole('button', { name: 'Next Step' });
  await nextButton.click();

  // add a product to the quote
  const addProductButton = page.getByRole('button', { name: 'Add Product' });
  await addProductButton.click();

  // fill in the add product modal
  const firstProductCheckbox = page.getByRole('combobox', { name: 'product' });
  await firstProductCheckbox.click();
  const firstProductOption = page.locator('div[role="option"]').first();
  await firstProductOption.click();
  const quantityInput = page.getByLabel('quantity');
  await quantityInput.fill('2');
  const descriptionInput = page.getByLabel('description');
  await descriptionInput.fill('__Test Description for Quote Product');
  const markupInput = page.getByLabel('markup');
  await markupInput.fill('100');
  const vatInput = page.getByLabel('vat');
  await vatInput.fill('20');

  // submit the add product form
  const addProductSubmitButton = page.getByRole('button', { name: 'Add Product' });
  await addProductSubmitButton.click();

  const nextButton2 = page.getByRole('button', { name: 'Next Step' });
  await nextButton2.click();

  // set quote status
  const statusSelect = page.getByRole('combobox', { name: 'quote' });
  await statusSelect.click();
  const statusOption = page.getByRole('option', { name: 'accepted' });
  await statusOption.click();

  // add notes
  const notesTextarea = page.getByLabel('notes');
  await notesTextarea.fill('These are E2E test notes for the quote.');

  // submit the quote
  const submitQuoteButton = page.getByRole('button', { name: 'Create Quote' });
  await submitQuoteButton.click();

  // check the quote appears in the top row of the quotes table
  const tableBody = page.locator('tbody');
  const firstTableRow = tableBody.locator('tr').first();
  const clientNameCell = firstTableRow.locator('td').nth(2);
  const clientNameFromTable = await clientNameCell.textContent();
  expect(clientNameFromTable).toBe(newClientName);
});
