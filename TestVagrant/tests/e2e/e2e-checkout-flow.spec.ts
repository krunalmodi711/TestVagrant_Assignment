import { test, expect } from '../../fixtures/page-fixtures';

test.describe('E2E: Login → Add to Cart → Checkout', () => {
  test('should complete full purchase flow from login to order confirmation', async ({
    inventoryPage, cartPage, checkoutPage, authenticatedPage,
  }) => {
    // Step 1: Navigate to inventory (already authenticated via storageState fixture)
    await authenticatedPage.goto('/inventory.html');
    await expect(inventoryPage.title).toHaveText('Products');

    // Step 2: Add products to cart
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await inventoryPage.addToCartByName('Sauce Labs Fleece Jacket');
    await expect(inventoryPage.cartBadge).toHaveText('2');

    // Step 3: Navigate to cart and verify items
    await inventoryPage.cartLink.click();
    await expect(authenticatedPage).toHaveURL(/cart/);
    await expect(cartPage.cartItems).toHaveCount(2);

    // Step 4: Proceed to checkout
    await cartPage.checkoutButton.click();
    await expect(authenticatedPage).toHaveURL(/checkout-step-one/);

    // Step 5: Fill checkout information
    await checkoutPage.fillInformation('John', 'Doe', '10001');
    await checkoutPage.continueButton.click();

    // Step 6: Verify order summary
    await expect(authenticatedPage).toHaveURL(/checkout-step-two/);
    await expect(checkoutPage.summaryTotal).toBeVisible();

    // Step 7: Finish order
    await checkoutPage.finishButton.click();

    // Step 8: Verify order confirmation
    await expect(authenticatedPage).toHaveURL(/checkout-complete/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutPage.completeText).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
    );
  });
});
