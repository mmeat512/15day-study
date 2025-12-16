import { test, expect } from '@playwright/test';

const BASE_URL = 'https://stock-study-web.vercel.app';

test('Capture production signup errors', async ({ page }) => {
  const timestamp = Date.now();
  const testUser = {
    email: `prod_error_${timestamp}@example.com`,
    username: `ProdError_${timestamp}`,
    password: 'password123',
  };

  // Capture ALL console messages and errors
  const consoleMessages: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type().toUpperCase()}] ${text}`);
  });

  // Capture page errors
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(`PAGE ERROR: ${error.message}\n${error.stack}`);
  });

  // Capture request failures
  const failedRequests: any[] = [];
  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText,
    });
  });

  console.log('\n========================================');
  console.log('🔍 PRODUCTION ERROR DEBUGGING');
  console.log('========================================\n');

  // Navigate to register page
  console.log('Navigating to register page...');
  await page.goto(`${BASE_URL}/register`);
  await page.waitForSelector('h2:has-text("Create an Account")');

  // Fill registration form
  console.log('Filling registration form...');
  await page.fill('input[name="email"]', testUser.email);
  await page.fill('input[name="username"]', testUser.username);
  await page.fill('input[name="password"]', testUser.password);
  await page.fill('input[name="confirmPassword"]', testUser.password);

  // Take screenshot before submit
  await page.screenshot({ path: '/tmp/prod-before-submit.png' });

  // Submit form
  console.log('Submitting form...');
  await page.click('button[type="submit"]');

  // Wait a bit for any errors to appear
  await page.waitForTimeout(5000);

  // Take screenshot after submit
  await page.screenshot({ path: '/tmp/prod-after-submit.png' });

  // Check for visible error messages on page
  const errorText = await page.locator('text=/error|failed|wrong/i').allTextContents();

  // Print all findings
  console.log('\n========================================');
  console.log('📊 RESULTS:');
  console.log('========================================\n');

  console.log(`Current URL: ${page.url()}`);
  console.log(`Test User: ${testUser.username} (${testUser.email})\n`);

  console.log('🖥️  CONSOLE MESSAGES:');
  if (consoleMessages.length > 0) {
    consoleMessages.forEach(msg => console.log(`  ${msg}`));
  } else {
    console.log('  (none)');
  }

  console.log('\n❌ PAGE ERRORS:');
  if (pageErrors.length > 0) {
    pageErrors.forEach(err => console.log(`  ${err}`));
  } else {
    console.log('  (none)');
  }

  console.log('\n🚫 FAILED REQUESTS:');
  if (failedRequests.length > 0) {
    failedRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
      console.log(`    Failure: ${req.failure}`);
    });
  } else {
    console.log('  (none)');
  }

  console.log('\n📝 VISIBLE ERROR TEXT ON PAGE:');
  if (errorText.length > 0) {
    errorText.forEach(text => console.log(`  "${text}"`));
  } else {
    console.log('  (none)');
  }

  console.log('\n📸 Screenshots saved:');
  console.log('  /tmp/prod-before-submit.png');
  console.log('  /tmp/prod-after-submit.png');

  console.log('\n========================================\n');
});
