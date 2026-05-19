import { test, expect } from '../../fixtures/page-fixtures';
import { ENV } from '../../env.config';

test.describe('Login Module', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test.describe('Positive Tests', () => {
    test('should login successfully with valid credentials', async ({ loginPage, page }) => {
      await loginPage.login(ENV.STANDARD_USER, ENV.PASSWORD);

      await expect(page).toHaveURL(/inventory/);
      await expect(page.getByTestId('title')).toHaveText('Products');
    });
  });

  test.describe('Negative Tests', () => {
    test('should show error for locked out user', async ({ loginPage }) => {
      await loginPage.login(ENV.LOCKED_OUT_USER, ENV.PASSWORD);

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText(
        'Sorry, this user has been locked out'
      );
    });

    test('should show error for invalid username', async ({ loginPage }) => {
      await loginPage.login('invalid_user', ENV.PASSWORD);

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText(
        'Username and password do not match any user in this service'
      );
    });

    test('should show error for invalid password', async ({ loginPage }) => {
      await loginPage.login('standard_user', 'wrong_password');

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText(
        'Username and password do not match any user in this service'
      );
    });

    test('should show error for empty username', async ({ loginPage }) => {
      await loginPage.login('', ENV.PASSWORD);

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText('Username is required');
    });

    test('should show error for empty password', async ({ loginPage }) => {
      await loginPage.login('standard_user', '');

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText('Password is required');
    });
  });
});
