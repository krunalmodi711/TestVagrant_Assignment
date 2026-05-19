import { test, expect } from '../../fixtures/api-fixtures';
import { ENV } from '../../env.config';

test.describe('API: Authentication - POST /auth', () => {
  test.describe('Positive Tests', () => {
    test('should return token with valid credentials', async ({ apiContext }) => {
      const response = await apiContext.post('/auth', {
        data: {
          username: ENV.API_USERNAME,
          password: ENV.API_PASSWORD,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('token');
      expect(typeof body.token).toBe('string');
      expect(body.token.length).toBeGreaterThan(0);
    });
  });

  test.describe('Negative Tests', () => {
    test('should return error with invalid username', async ({ apiContext }) => {
      const response = await apiContext.post('/auth', {
        data: {
          username: 'invaliduser',
          password: ENV.API_PASSWORD,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('reason', 'Bad credentials');
    });

    test('should return error with invalid password', async ({ apiContext }) => {
      const response = await apiContext.post('/auth', {
        data: {
          username: ENV.API_USERNAME,
          password: 'wrongpassword',
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('reason', 'Bad credentials');
    });

    test('should return error with empty credentials', async ({ apiContext }) => {
      const response = await apiContext.post('/auth', {
        data: {
          username: '',
          password: '',
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('reason', 'Bad credentials');
    });
  });
});
