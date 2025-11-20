import { test, expect } from '@playwright/test';

test('should be able to edit a product', async ({ page }, testInfo) => {
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

  // navigate to the products page
  const nav = page.locator('nav');
  if (testInfo.project.name === 'Mobile Safari' || testInfo.project.name === 'Mobile Chrome') {
    const mobileMenuButton = nav.getByLabel('Open Menu');
    await mobileMenuButton.click();
    const addClientButton = page.getByRole('link', { name: 'View Products' });
    await addClientButton.click();
  } else {
    const productsNavLink = nav.getByRole('button', { name: 'Product' });
    await productsNavLink.click();
    const addProductLink = page.locator('a[href="/view-products"]');
    await addProductLink.click();
  }

  // click the edit link for the first product in the list
  const editLink = page.locator('tbody a:visible').first();
  await expect(editLink).toBeVisible();
  await editLink.click();

  const nameInput = page.getByLabel('name');
  const updatedProductName = `__Test Suite Product ${Date.now()}`;
  await nameInput.fill(updatedProductName);

  // submit the form
  const submitProductButton = page.getByRole('button', { name: 'Save Changes' });
  await submitProductButton.click();

  // search for the new product in the client list
  const searchInput = page.getByPlaceholder('Search by name...');
  await searchInput.fill(updatedProductName);
  const searchButton = page.getByRole('button', { name: 'Search Products' });
  await searchButton.click();

  // check the new product appears in the list
  const newProduct = page.getByRole('cell', { name: updatedProductName });
  await expect(newProduct).toBeVisible();
});
