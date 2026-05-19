import { test, expect } from '../../fixtures/api-fixtures';

test.describe('API: Health Check - GET /ping', () => {
  test('should return 201 indicating API is up', async ({ apiContext }) => {
    const response = await apiContext.get('/ping');

    expect(response.status()).toBe(201);
  });
});
