import { test as base, APIRequestContext } from '@playwright/test';
import { ENV } from '../env.config';

type ApiWorkerFixtures = {
  authToken: string;
};

type ApiFixtures = {
  apiContext: APIRequestContext;
};

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  // Worker-scoped: authenticates once per worker and caches the token
  authToken: [async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: ENV.API_BASE_URL,
    });

    const response = await context.post('/auth', {
      data: {
        username: ENV.API_USERNAME,
        password: ENV.API_PASSWORD,
      },
    });

    const body = await response.json();
    await context.dispose();

    await use(body.token);
  }, { scope: 'worker' }],

  // Test-scoped: fresh API context per test with base URL configured
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: ENV.API_BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    await use(context);
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
