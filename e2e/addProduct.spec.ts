import { test, expect } from '@playwright/test';

test('should be able to add a product', async ({ page }, testInfo) => {
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

  // navigate to the product page
  const nav = page.locator('nav');
  if (testInfo.project.name === 'Mobile Safari' || testInfo.project.name === 'Mobile Chrome') {
    const mobileMenuButton = nav.getByLabel('Open Menu');
    await mobileMenuButton.click();
    const addProductButton = page.getByRole('link', { name: 'Add Product' });
    await addProductButton.click();
  } else {
    const ProductsNavLink = nav.getByRole('button', { name: 'Product' });
    await ProductsNavLink.click();
    const addProductLink = page.locator('a[href="/add-product"]');
    await addProductLink.click();
  }

  // fill out the add product form
  const newProductName = `__Test Suite Product ${Date.now()}`;

  const nameInput = page.getByLabel('name');
  await nameInput.fill(newProductName);
  const descriptionInput = page.getByLabel('description');
  await descriptionInput.fill('Description for E2E Test Product');
  const valueInput = page.getByLabel('value');
  await valueInput.fill('100.00');
  const markupInput = page.getByLabel('Default Markup %');
  await markupInput.fill('20');
  const vatInput = page.getByLabel('Default VAT %');
  await vatInput.fill('20');

  // submit the form
  const submitProductButton = page.getByRole('button', { name: 'Add Product' });
  await submitProductButton.click();

  // search for the new product in the product list
  const searchInput = page.getByPlaceholder('Search by name...');
  await searchInput.fill(newProductName);
  const searchButton = page.getByRole('button', { name: 'Search Products' });
  await searchButton.click();

  // check the new product appears in the list
  const newProductMatches = page.getByRole('cell', { name: newProductName });
  await expect(newProductMatches).toBeVisible();
});
