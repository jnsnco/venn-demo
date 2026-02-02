# Browser Automation Tests

Playwright-based browser tests for venn production site.

## Setup

Already installed! Playwright and Chromium are ready to go.

**What's installed:**
- `@playwright/test` - Testing framework
- Chromium browser (headless)
- Video recording for failed tests
- Screenshot capture on failure

## Running Tests

**Run all tests (headless):**
```bash
cd tests/browser
pnpm test
```

**Run with visible browser:**
```bash
pnpm test:headed
```

**Run with UI mode (interactive):**
```bash
pnpm test:ui
```

**Run specific test file:**
```bash
npx playwright test tests/smoke.spec.js
```

## Test Files

- **`tests/smoke.spec.js`** - Basic smoke tests for production site
  - Homepage loads
  - Login page displays correctly
  - OAuth button works
  - Site returns 200 OK

## Adding New Tests

Create new `.spec.js` files in the `tests/` directory:

```javascript
import { test, expect } from '@playwright/test';

test('my test name', async ({ page }) => {
  await page.goto('/');
  
  // Your test code here
  await expect(page.locator('h1')).toBeVisible();
});
```

## Configuration

Edit `playwright.config.js` to change:
- Base URL (currently `https://venn-demo.avan.academy`)
- Timeouts
- Screenshot/video settings
- Browser options

## Debugging Failed Tests

When tests fail, check:
- `test-results/` directory for screenshots
- `test-results/` directory for videos
- Console output for error messages

**View trace files:**
```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

## CI/CD Integration

To run in CI (GitHub Actions, etc.):
```bash
cd tests/browser
pnpm install
npx playwright install chromium
pnpm test
```

## Agent Usage

The agent (Barrow) can run these tests to verify UI changes:

```bash
# Run smoke tests to verify production site
cd venn/tests/browser && pnpm test

# Check if OAuth login works
pnpm test -- tests/smoke.spec.js -g "OAuth"

# Run all tests and save results
pnpm test > test-results.txt 2>&1
```

## Benefits for Agent Workflow

✅ **Independent testing** - Agent can verify UI without human help  
✅ **Fast feedback** - Catch visual bugs before deployment  
✅ **Regression prevention** - Existing tests run on every change  
✅ **Documentation** - Tests serve as executable documentation

---

**Installed:** 2026-02-02  
**Purpose:** Enable agent to test UI independently (venn-b14)
