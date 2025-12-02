import { test, expect } from '@playwright/test';

// add a client first, then change the quote to use that client
// this is to allow the test to assert than the client for the quote can be changed

test('should be able to edit a quote', async ({ page }, testInfo) => {
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

  // navigate to the view quotes page
  if (testInfo.project.name === 'Mobile Safari' || testInfo.project.name === 'Mobile Chrome') {
    const mobileMenuButton = nav.getByLabel('Open Menu');
    await mobileMenuButton.click();
    const addClientButton = page.getByRole('link', { name: 'View Quotes' });
    await addClientButton.click();
  } else {
    const productsNavLink = nav.getByRole('button', { name: 'Quote' });
    await productsNavLink.click();
    const addProductLink = page.locator('a[href="/view-quotes"]');
    await addProductLink.click();
  }

  // click the edit link for the first quote in the list
  await expect(page).toHaveURL(/\/view-quotes$/);
  const firstDataRow = page.getByRole('row').nth(1);
  await expect(firstDataRow).toBeVisible();
  const firstQuoteActionButton = firstDataRow.getByRole('button', { name: 'Quote Actions' });
  await firstQuoteActionButton.click();

  // now interact with the menu
  const editLink = page.getByRole('menuitem', { name: 'Edit Quote' });
  await expect(editLink).toBeVisible();
  await editLink.click();

  // select a different client from the dropdown
  const clientSelect = page.getByRole('combobox', { name: 'Client *' });
  await clientSelect.click();
  const clientOption = page.locator('div[role="option"]', { hasText: newClientName });
  await clientOption.click();
  const nextButton = page.getByRole('button', { name: 'Next Step' });
  await nextButton.click();

  // edit a quote product
  const editQuoteActionButton = page.getByTestId('edit-quote-product-action-button').first();
  await editQuoteActionButton.click();
  const editProductButton = page.getByRole('menuitem', { name: 'Edit' });
  await editProductButton.click();

  //fill in the edit product modal
  const quantityInput = page.getByLabel('quantity');
  await quantityInput.fill('3');
  const descriptionInput = page.getByLabel('description');
  await descriptionInput.fill('__Test Description for Quote Product Updated');
  const markupInput = page.getByLabel('markup');
  await markupInput.fill('200');
  const vatInput = page.getByLabel('vat');
  await vatInput.fill('0');

  // submit the edit product form
  const editProductSubmitButton = page.getByRole('button', { name: 'Save Changes' });
  await editProductSubmitButton.click();

  // navigate to quote summary step
  const nextButton2 = page.getByRole('button', { name: 'Next Step' });
  await nextButton2.click();

  // click update quote button
  const updateQuoteButton = page.getByRole('button', { name: 'Update Quote' });
  await updateQuoteButton.click();

  // check the page navigates to the view quotes page
  await expect(page).toHaveURL(/\/view-quotes$/);
});
