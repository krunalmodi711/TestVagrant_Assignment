import { test, expect } from '../../fixtures/page-fixtures';

test.describe('Shopping Cart / Checkout', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/inventory.html');
  });

  test.describe('Positive Tests - Complete Checkout Flow', () => {
    test('should complete checkout with a single item', async ({ inventoryPage, cartPage, checkoutPage, authenticatedPage }) => {
      await inventoryPage.addToCartByName('Sauce Labs Backpack');
      await inventoryPage.cartLink.click();

      await expect(authenticatedPage).toHaveURL(/cart/);
      await expect(cartPage.cartItems).toHaveCount(1);

      await cartPage.checkoutButton.click();
      await expect(authenticatedPage).toHaveURL(/checkout-step-one/);

      await checkoutPage.fillInformation('John', 'Doe', '12345');
      await checkoutPage.continueButton.click();

      await expect(authenticatedPage).toHaveURL(/checkout-step-two/);
      await expect(checkoutPage.summaryTotal).toBeVisible();

      await checkoutPage.finishButton.click();

      await expect(authenticatedPage).toHaveURL(/checkout-complete/);
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    });

    test('should complete checkout with multiple items', async ({ inventoryPage, cartPage, checkoutPage, authenticatedPage }) => {
      await inventoryPage.addToCartByName('Sauce Labs Backpack');
      await inventoryPage.addToCartByName('Sauce Labs Bike Light');
      await inventoryPage.cartLink.click();

      await expect(cartPage.cartItems).toHaveCount(2);

      await cartPage.checkoutButton.click();
      await checkoutPage.fillInformation('Jane', 'Smith', '67890');
      await checkoutPage.continueButton.click();

      await expect(authenticatedPage).toHaveURL(/checkout-step-two/);
      await checkoutPage.finishButton.click();

      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    });

    test('should display correct item in cart before checkout', async ({ inventoryPage, cartPage }) => {
      await inventoryPage.addToCartByName('Sauce Labs Bolt T-Shirt');
      await inventoryPage.cartLink.click();

      await expect(cartPage.cartItems).toHaveCount(1);
      await expect(cartPage.cartItems.getByTestId('inventory-item-name')).toHaveText(
        'Sauce Labs Bolt T-Shirt'
      );
    });

    test('should allow removing items from cart before checkout', async ({ inventoryPage, cartPage }) => {
      await inventoryPage.addToCartByName('Sauce Labs Backpack');
      await inventoryPage.addToCartByName('Sauce Labs Bike Light');
      await inventoryPage.cartLink.click();

      await expect(cartPage.cartItems).toHaveCount(2);

      await cartPage.removeItem('Sauce Labs Backpack');

      await expect(cartPage.cartItems).toHaveCount(1);
      await expect(cartPage.cartItems.getByTestId('inventory-item-name')).toHaveText(
        'Sauce Labs Bike Light'
      );
    });
  });

  test.describe('Negative Tests - Checkout Form Validation', () => {
    test.beforeEach(async ({ inventoryPage, cartPage, authenticatedPage }) => {
      await inventoryPage.addToCartByName('Sauce Labs Backpack');
      await inventoryPage.cartLink.click();
      await cartPage.checkoutButton.click();
      await expect(authenticatedPage).toHaveURL(/checkout-step-one/);
    });

    test('should show error when first name is empty', async ({ checkoutPage }) => {
      await checkoutPage.fillInformation('', 'Doe', '12345');
      await checkoutPage.continueButton.click();

      await expect(checkoutPage.errorMessage).toBeVisible();
      await expect(checkoutPage.errorMessage).toContainText('First Name is required');
    });

    test('should show error when last name is empty', async ({ checkoutPage }) => {
      await checkoutPage.fillInformation('John', '', '12345');
      await checkoutPage.continueButton.click();

      await expect(checkoutPage.errorMessage).toBeVisible();
      await expect(checkoutPage.errorMessage).toContainText('Last Name is required');
    });

    test('should show error when postal code is empty', async ({ checkoutPage }) => {
      await checkoutPage.fillInformation('John', 'Doe', '');
      await checkoutPage.continueButton.click();

      await expect(checkoutPage.errorMessage).toBeVisible();
      await expect(checkoutPage.errorMessage).toContainText('Postal Code is required');
    });

    test('should show error when all fields are empty', async ({ checkoutPage }) => {
      await checkoutPage.continueButton.click();

      await expect(checkoutPage.errorMessage).toBeVisible();
      await expect(checkoutPage.errorMessage).toContainText('First Name is required');
    });

    test('should allow canceling checkout and returning to cart', async ({ checkoutPage, authenticatedPage }) => {
      await checkoutPage.cancelButton.click();

      await expect(authenticatedPage).toHaveURL(/cart/);
    });
  });
});
