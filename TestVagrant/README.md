# Playwright Test Automation Framework — UI & API

Automated test suite for [SauceDemo](https://www.saucedemo.com/) (UI) and [Restful-Booker](https://restful-booker.herokuapp.com/) (API) built with Playwright and TypeScript, implementing Page Object Model, custom fixtures, and worker-scoped authentication.

## Setup Instructions

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd TestVagrant

# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps
```

### Environment Configuration

Create a `.env` file in the root directory (see `.env.example`):

```env
# UI Tests - SauceDemo
BASE_URL=https://www.saucedemo.com/
STANDARD_USER=standard_user
LOCKED_OUT_USER=locked_out_user
PASSWORD=secret_sauce

# API Tests - Restful-Booker
API_BASE_URL=https://restful-booker.herokuapp.com
API_USERNAME=admin
API_PASSWORD=password123
```

## How to Run Tests

```bash
# Run all tests (UI + API)
npx playwright test

# Run only UI tests (Chromium)
npx playwright test --project=chromium

# Run only API tests
npx playwright test --project=api

# Run a specific UI test module
npx playwright test tests/login/
npx playwright test tests/product-catalog/
npx playwright test tests/checkout/
npx playwright test tests/e2e/

# Run a specific API test module
npx playwright test tests/api/auth.spec.ts
npx playwright test tests/api/booking-get.spec.ts
npx playwright test tests/api/booking-create-update.spec.ts
npx playwright test tests/api/booking-delete.spec.ts
npx playwright test tests/api/e2e-booking-flow.spec.ts

# Run in headed mode (UI tests only)
npx playwright test --project=chromium --headed

# Run in UI mode (interactive)
npx playwright test --ui

# View the HTML report
npx playwright show-report
```

## Framework Architecture

```
TestVagrant/
├── .github/workflows/
│   └── playwright.yml           # CI/CD pipeline
├── fixtures/
│   ├── page-fixtures.ts         # UI fixtures (auth + page objects)
│   └── api-fixtures.ts          # API fixtures (auth token + request context)
├── pages/                       # Page Object Model classes
│   ├── login.page.ts
│   ├── inventory.page.ts
│   ├── cart.page.ts
│   └── checkout.page.ts
├── tests/
│   ├── login/                   # Login module tests
│   ├── product-catalog/         # Product catalog tests
│   ├── checkout/                # Shopping cart & checkout tests
│   ├── e2e/                     # UI end-to-end flow tests
│   └── api/                     # API tests
│       ├── auth.spec.ts
│       ├── booking-get.spec.ts
│       ├── booking-create-update.spec.ts
│       ├── booking-delete.spec.ts
│       ├── ping.spec.ts
│       └── e2e-booking-flow.spec.ts
├── env.config.ts                # Environment variable loader
├── playwright.config.ts         # Playwright configuration
├── .env                         # Environment variables (not committed)
└── package.json
```

### Design Patterns

#### 1. Page Object Model (POM)
Each page has a dedicated class in `pages/` encapsulating locators and actions:

```typescript
// pages/login.page.ts
export class LoginPage {
  readonly usernameInput: Locator;
  readonly loginButton: Locator;

  async login(username: string, password: string) { ... }
}
```

#### 2. Custom Fixtures
Defined in `fixtures/page-fixtures.ts` (UI) and `fixtures/api-fixtures.ts` (API). Dependencies are injected into tests automatically:

```typescript
// UI test — page objects injected
test('example', async ({ loginPage, inventoryPage, cartPage }) => {
  // No manual instantiation needed
});

// API test — request context and auth token injected
test('example', async ({ apiContext, authToken }) => {
  const response = await apiContext.get('/booking');
});
```

#### 3. Worker-Scoped Authentication

**UI Tests:** Storage state (cookies/localStorage) is captured once per worker and reused:
```typescript
authenticatedWorkerState: [async ({ browser }, use) => {
  // Login once, cache state in memory
}, { scope: 'worker' }],
```

**API Tests:** Auth token is obtained once per worker and injected into tests:
```typescript
authToken: [async ({ playwright }, use) => {
  // POST /auth once, cache token
}, { scope: 'worker' }],
```

This means:
- Login tests use fresh `page` (unauthenticated)
- All other UI tests use `authenticatedPage` (pre-authenticated)
- API tests requiring auth receive `authToken` fixture
- No file-based race conditions between workers

#### 4. Environment Configuration
Centralized in `env.config.ts` with a reusable `getEnvVariable()` method that throws descriptive errors for missing variables.

#### 5. Project-Based Test Separation
Playwright config defines separate projects:
- `chromium` / `firefox` / `webkit` — UI tests (ignores `tests/api/`)
- `api` — API tests (no browser needed, uses `APIRequestContext`)

### Locator Strategy (UI Tests)

The framework uses Playwright's recommended locators in priority order:
1. `getByRole()` — buttons, links (most resilient)
2. `getByTestId()` — elements with `data-test` attribute
3. `getByPlaceholder()` — input fields
4. `.filter()` + chaining — scoped element selection

Configured via `testIdAttribute: 'data-test'` in `playwright.config.ts`.

### API Test Strategy

#### Test Design Approach
- **Positive tests**: Verify correct behavior with valid inputs and proper authentication
- **Negative tests**: Verify error handling for invalid inputs, missing auth, and non-existent resources
- **E2E test**: Validates the complete lifecycle (Create → Update → Verify → Delete) to ensure data consistency

#### Validation Layers
Each API test validates multiple layers:
1. **Response status code** — correct HTTP status (200, 201, 403, 404, 405)
2. **Response schema** — all expected fields present with correct types (string, number, boolean, object)
3. **Data integrity** — values returned match what was sent (round-trip verification)
4. **Authentication & Authorization** — protected endpoints (PUT, PATCH, DELETE) reject requests without valid token

#### API Endpoints Covered

| Endpoint | Method | Auth Required | Description |
|----------|--------|:---:|---|
| `/auth` | POST | No | Generate auth token |
| `/booking` | GET | No | List all booking IDs (supports filters: firstname, lastname, checkin, checkout) |
| `/booking/:id` | GET | No | Get booking details by ID |
| `/booking` | POST | No | Create a new booking |
| `/booking/:id` | PUT | Yes (Cookie/Basic) | Full update of a booking |
| `/booking/:id` | PATCH | Yes (Cookie/Basic) | Partial update of a booking |
| `/booking/:id` | DELETE | Yes (Cookie/Basic) | Delete a booking |
| `/ping` | GET | No | Health check (returns 201) |

#### Authentication Approach
- Auth token is obtained via `POST /auth` with admin credentials
- Token is passed as `Cookie: token=<value>` header for protected endpoints
- Worker-scoped fixture ensures token is fetched only once per worker (no redundant auth calls)

## Team Onboarding Guide

### Adding a New UI Test

1. **Create a page object** (if the page doesn't have one):
   ```typescript
   // pages/new-feature.page.ts
   import { Page, Locator } from '@playwright/test';

   export class NewFeaturePage {
     readonly page: Page;
     readonly someButton: Locator;

     constructor(page: Page) {
       this.page = page;
       this.someButton = page.getByRole('button', { name: 'Submit' });
     }
   }
   ```

2. **Register it as a fixture** in `fixtures/page-fixtures.ts`:
   ```typescript
   newFeaturePage: async ({ authenticatedPage }, use) => {
     await use(new NewFeaturePage(authenticatedPage));
   },
   ```

3. **Write the test**:
   ```typescript
   import { test, expect } from '../../fixtures/page-fixtures';

   test('should do something', async ({ newFeaturePage }) => {
     // test code
   });
   ```

### Adding a New API Test

1. **Create a test file** in `tests/api/`:
   ```typescript
   import { test, expect } from '../../fixtures/api-fixtures';

   test('should return data', async ({ apiContext, authToken }) => {
     const response = await apiContext.get('/endpoint', {
       headers: { Cookie: `token=${authToken}` },  // if auth required
     });
     expect(response.status()).toBe(200);
   });
   ```

2. The `apiContext` fixture provides a pre-configured `APIRequestContext` with:
   - `baseURL` set to the API
   - `Content-Type: application/json` header
   - `Accept: application/json` header

3. The `authToken` fixture provides a valid auth token (obtained once per worker).

### Adding a New Environment Variable

1. Add to `.env` and `.env.example`:
   ```env
   NEW_VARIABLE=value
   ```

2. Add to `env.config.ts`:
   ```typescript
   export const ENV = {
     ...
     NEW_VARIABLE: getEnvVariable('NEW_VARIABLE'),
   };
   ```

### Conventions

- **UI test files**: `tests/<module>/<module>.spec.ts`
- **API test files**: `tests/api/<endpoint>.spec.ts`
- **Page objects**: `pages/<page-name>.page.ts`
- **Locators**: Prefer `getByRole` > `getByTestId` > `getByPlaceholder`
- **Assertions**: Use Playwright's auto-waiting `expect` (e.g., `toBeVisible()`, `toHaveText()`)
- **Test isolation**: Each test gets a fresh browser context / API context — no shared state between tests

## CI/CD Pipeline Details

### GitHub Actions Workflow

Located at `.github/workflows/playwright.yml`:

```yaml
Trigger: Push/PR to main or master branches
Runner: ubuntu-latest
Steps:
  1. Checkout code
  2. Setup Node.js (LTS)
  3. Install dependencies (npm ci)
  4. Install Playwright browsers (with system deps)
  5. Run all Playwright tests (UI + API)
  6. Upload HTML report as artifact (retained 30 days)
```

### Pipeline Behavior

- **On push to main/master**: Full test suite runs (UI + API)
- **On pull request**: Full test suite runs as a check
- **On failure**: HTML report is uploaded as an artifact for debugging
- **Timeout**: 60 minutes max

### Viewing CI Results

1. Go to the **Actions** tab in the GitHub repository
2. Click on a workflow run to see test results
3. Download the `playwright-report` artifact for detailed HTML report

### Running in CI with Environment Variables

For CI, set secrets in GitHub repository settings:
- `Settings` → `Secrets and variables` → `Actions`
- Add: `BASE_URL`, `STANDARD_USER`, `LOCKED_OUT_USER`, `PASSWORD`, `API_BASE_URL`, `API_USERNAME`, `API_PASSWORD`

Update the workflow to pass them:
```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    BASE_URL: ${{ secrets.BASE_URL }}
    STANDARD_USER: ${{ secrets.STANDARD_USER }}
    PASSWORD: ${{ secrets.PASSWORD }}
    LOCKED_OUT_USER: ${{ secrets.LOCKED_OUT_USER }}
    API_BASE_URL: ${{ secrets.API_BASE_URL }}
    API_USERNAME: ${{ secrets.API_USERNAME }}
    API_PASSWORD: ${{ secrets.API_PASSWORD }}
```

## Test Coverage Summary

### Part 1: Web UI Automation (SauceDemo)

| Module | Positive Tests | Negative Tests | Total |
|--------|---------------|----------------|-------|
| Login | 1 | 5 | 6 |
| Product Catalog | 4 | 5 | 9 |
| Shopping Cart / Checkout | 4 | 5 | 9 |
| E2E Flow (Login → Cart → Checkout) | 1 | — | 1 |
| **Subtotal** | **10** | **15** | **25** |

### Part 2: API Automation (Restful-Booker)

| Endpoint | Positive Tests | Negative Tests | Total |
|----------|---------------|----------------|-------|
| POST /auth | 1 | 3 | 4 |
| GET /booking | 4 | — | 4 |
| GET /booking/:id | 1 | 2 | 3 |
| POST /booking | 2 | 2 | 4 |
| PUT /booking/:id | 1 | 2 | 3 |
| PATCH /booking/:id | 1 | 2 | 3 |
| DELETE /booking/:id | 1 | 2 | 3 |
| GET /ping | 1 | — | 1 |
| E2E Flow (Create → Update → Verify → Delete) | 1 | — | 1 |
| **Subtotal** | **13** | **13** | **26** |

### Grand Total: 51 tests
