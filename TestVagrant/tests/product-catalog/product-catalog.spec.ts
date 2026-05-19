import { test, expect } from '../../fixtures/page-fixtures';

test.describe('Product Catalog', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/inventory.html');
  });

  test.describe('Positive Tests', () => {
    test('should add a single product to cart', async ({ inventoryPage }) => {
      await inventoryPage.addToCartByName('Sauce Labs Backpack');

      await expect(inventoryPage.cartBadge).toHaveText('1');
    });

    test('should add multiple products to cart', async ({ inventoryPage }) => {
      await inventoryPage.addToCartByName('Sauce Labs Backpack');
      await inventoryPage.addToCartByName('Sauce Labs Bike Light');

      await expect(inventoryPage.cartBadge).toHaveText('2');
    });

    test('should show Remove button after adding product', async ({ inventoryPage }) => {
      await inventoryPage.addToCartByName('Sauce Labs Backpack');

      const item = inventoryPage.inventoryItems.filter({ hasText: 'Sauce Labs Backpack' });
      await expect(item.getByRole('button')).toHaveText('Remove');
    });

    test('should add product to cart from product detail page', async ({ inventoryPage, authenticatedPage }) => {
      await inventoryPage.openProductDetail('Sauce Labs Backpack');
      await authenticatedPage.getByRole('button', { name: 'Add to cart' }).click();

      await expect(inventoryPage.cartBadge).toHaveText('1');
    });
  });

  test.describe('Negative Tests', () => {
    test('should not show cart badge when no products are added', async ({ inventoryPage }) => {
      await expect(inventoryPage.cartBadge).not.toBeVisible();
    });

    test('should decrement cart count when removing a product', async ({ inventoryPage }) => {
      await inventoryPage.addToCartByName('Sauce Labs Backpack');
      await inventoryPage.addToCartByName('Sauce Labs Bike Light');
      await expect(inventoryPage.cartBadge).toHaveText('2');

      await inventoryPage.removeFromCartByName('Sauce Labs Backpack');

      await expect(inventoryPage.cartBadge).toHaveText('1');
    });

    test('should remove cart badge when last product is removed', async ({ inventoryPage }) => {
      await inventoryPage.addToCartByName('Sauce Labs Backpack');
      await expect(inventoryPage.cartBadge).toHaveText('1');

      await inventoryPage.removeFromCartByName('Sauce Labs Backpack');

      await expect(inventoryPage.cartBadge).not.toBeVisible();
    });

    test('should not allow access to inventory without login', async ({ page }) => {
      await page.goto('https://www.saucedemo.com/inventory.html');

      await expect(page.getByTestId('error')).toContainText(
        "You can only access '/inventory.html' when you are logged in"
      );
    });

    test('should show error for a non-existent product', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('https://www.saucedemo.com/inventory-item.html?id=99');

      await expect(authenticatedPage.getByTestId('inventory-item-name')).toHaveText('ITEM NOT FOUND');
      await expect(authenticatedPage.getByTestId('inventory-item-desc')).toContainText(
        "We're sorry, but your call could not be completed as dialled"
      );
    });
  });
});
