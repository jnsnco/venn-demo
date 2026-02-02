import { test, expect } from '@playwright/test';

test.describe('Debug Create Button Issues', () => {
  
  test.beforeEach(async ({ page }) => {
    // Note: We need to be authenticated to test these buttons
    // For now, we'll just check if buttons exist and are clickable
    await page.goto('/');
  });
  
  test('check if Create Contact button exists on contacts page', async ({ page, context }) => {
    // Try to navigate to contacts (will redirect to login if not authenticated)
    await page.goto('/contacts');
    
    // Check current URL
    const url = page.url();
    console.log('Current URL:', url);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/contacts-page.png', fullPage: true });
    
    // Log page content
    const content = await page.content();
    console.log('Page title:', await page.title());
    console.log('Page has "Create" text:', content.includes('Create'));
  });
  
  test('check console errors on contacts page', async ({ page }) => {
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => errors.push(error.message));
    
    await page.goto('/contacts');
    await page.waitForTimeout(2000);
    
    console.log('Console messages:', consoleMessages);
    console.log('Page errors:', errors);
    
    // Log any errors to file
    if (errors.length > 0 || consoleMessages.some(m => m.includes('error'))) {
      console.log('ERRORS FOUND:');
      errors.forEach(e => console.log('  -', e));
      consoleMessages.filter(m => m.includes('error')).forEach(m => console.log('  -', m));
    }
  });
});
