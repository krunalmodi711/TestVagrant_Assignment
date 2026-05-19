import { test as base, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { ENV } from '../env.config';

type WorkerFixtures = {
  authenticatedWorkerState: string;
};

type PageFixtures = {
  loginPage: LoginPage;
  authenticatedContext: BrowserContext;
  authenticatedPage: Page;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<PageFixtures, WorkerFixtures>({
  // Worker-scoped fixture: authenticates ONCE per worker and stores state as a temp file
  authenticatedWorkerState: [async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(ENV.BASE_URL);
    await page.getByPlaceholder('Username').fill(ENV.STANDARD_USER);
    await page.getByPlaceholder('Password').fill(ENV.PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/inventory/);

    const storageState = await context.storageState();
    const stateString = JSON.stringify(storageState);

    await page.close();
    await context.close();

    await use(stateString);
  }, { scope: 'worker' }],

  // Test-scoped: creates a fresh context per test using the worker's auth state
  authenticatedContext: async ({ browser, authenticatedWorkerState }, use) => {
    const storageState = JSON.parse(authenticatedWorkerState);
    const context = await browser.newContext({ storageState });
    await use(context);
    await context.close();
  },

  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    await use(page);
  },

  // Unauthenticated fixture for login tests
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // Authenticated page object fixtures
  inventoryPage: async ({ authenticatedPage }, use) => {
    await use(new InventoryPage(authenticatedPage));
  },

  cartPage: async ({ authenticatedPage }, use) => {
    await use(new CartPage(authenticatedPage));
  },

  checkoutPage: async ({ authenticatedPage }, use) => {
    await use(new CheckoutPage(authenticatedPage));
  },
});

export { expect } from '@playwright/test';
