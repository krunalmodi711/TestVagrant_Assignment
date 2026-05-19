import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.inventoryItems = page.getByTestId('inventory-item');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  async addToCartByName(productName: string) {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCartByName(productName: string) {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Remove' }).click();
  }

  async getCartCount(): Promise<string> {
    return await this.cartBadge.textContent() ?? '0';
  }

  async openProductDetail(productName: string) {
    await this.inventoryItems
      .filter({ hasText: productName })
      .getByTestId('inventory-item-name')
      .click();
  }
}
