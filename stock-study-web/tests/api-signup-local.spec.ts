import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3090';

test('Test server-side API signup on localhost', async ({ page }) => {
  const timestamp = Date.now();
  const testUser = {
    email: `api_test_${timestamp}@example.com`,
    username: `APITest_${timestamp}`,
    password: 'password123',
  };

  // Capture console messages
  const consoleMessages: string[] = [];
  page.on('console', (msg) => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  console.log('\n========================================');
  console.log('🧪 TESTING SERVER-SIDE API ON LOCALHOST');
  console.log('========================================\n');
  console.log(`Test User: ${testUser.username} (${testUser.email})\n`);

  // Navigate to register page
  await page.goto(`${BASE_URL}/register`);
  await page.waitForSelector('h2:has-text("Create an Account")');

  // Fill registration form
  await page.fill('input[name="email"]', testUser.email);
  await page.fill('input[name="username"]', testUser.username);
  await page.fill('input[name="password"]', testUser.password);
  await page.fill('input[name="confirmPassword"]', testUser.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard or error
  await Promise.race([
    page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 }).catch(() => {}),
    page.waitForSelector('text=/error|failed/i', { timeout: 10000 }).catch(() => {})
  ]);

  // Give some time for all async operations
  await page.waitForTimeout(2000);

  console.log('========================================');
  console.log('📋 CONSOLE LOGS:');
  console.log('========================================\n');
  consoleMessages.forEach(msg => console.log(msg));

  console.log('\n========================================');
  console.log('🎯 RESULTS:');
  console.log('========================================\n');
  console.log(`Current URL: ${page.url()}`);

  // Check for key log messages
  const apiCallLog = consoleMessages.find(m => m.includes('Creating Firestore user document via API'));
  const apiSuccessLog = consoleMessages.find(m => m.includes('Firestore user document created successfully via API'));
  const apiErrorLog = consoleMessages.find(m => m.includes('Failed to create Firestore document via API'));

  console.log(`\n✓ API call initiated: ${apiCallLog ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ API success: ${apiSuccessLog ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ API error: ${apiErrorLog ? 'YES ⚠️ - Check logs above' : 'NO ✅'}`);
  console.log(`✓ Redirected to dashboard: ${page.url().includes('/dashboard') ? 'YES ✅' : 'NO ❌'}`);

  console.log('\n========================================\n');

  // Assertions
  expect(page.url()).toBe(`${BASE_URL}/dashboard`);
  expect(apiCallLog).toBeTruthy();
  expect(apiSuccessLog).toBeTruthy();
  expect(apiErrorLog).toBeUndefined();
});
