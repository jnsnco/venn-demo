import { test, expect } from '@playwright/test';

test.describe('Venn Production - Smoke Tests', () => {
  
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login page since we're not authenticated
    await expect(page).toHaveURL(/\/(login)?$/);
    
    // Check page title
    await expect(page).toHaveTitle(/venn/i);
  });
  
  test('login page has GitHub OAuth button', async ({ page }) => {
    await page.goto('/');
    
    // Wait for login page to load
    await page.waitForSelector('button:has-text("Sign in with GitHub")');
    
    // Verify venn branding exists
    await expect(page.locator('h1:has-text("venn")')).toBeVisible();
    
    // Verify tagline
    await expect(page.locator('text=CRM · Support · Roadmap')).toBeVisible();
    
    // Verify GitHub login button
    const loginButton = page.locator('button:has-text("Sign in with GitHub")');
    await expect(loginButton).toBeVisible();
  });
  
  test('GitHub OAuth button redirects to GitHub', async ({ page }) => {
    await page.goto('/');
    
    // Click the GitHub login button and wait for navigation
    const loginButton = page.locator('button:has-text("Sign in with GitHub")');
    
    // Start waiting for navigation before clicking
    const navigationPromise = page.waitForURL(/github\.com/, { timeout: 10000 });
    await loginButton.click();
    await navigationPromise;
    
    // Verify we're on GitHub
    await expect(page).toHaveURL(/github\.com/);
  });
  
  test('site responds with correct status and content', async ({ page }) => {
    const response = await page.goto('/');
    
    // Should return 200 OK
    expect(response?.status()).toBe(200);
    
    // Verify content type is HTML
    const headers = response?.headers();
    expect(headers?.['content-type']).toContain('text/html');
    
    // Verify page has expected content
    await expect(page.locator('h1:has-text("venn")')).toBeVisible();
  });
});
