import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3090';

test('Debug Firestore document creation during signup', async ({ page }) => {
  const timestamp = Date.now();
  const testUser = {
    email: `debug_${timestamp}@example.com`,
    username: `Debug_${timestamp}`,
    password: 'password123',
  };

  // Capture all console messages
  const consoleMessages: string[] = [];
  const consoleErrors: string[] = [];

  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);

    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  // Navigate to register page
  await page.goto(`${BASE_URL}/register`);

  // Fill registration form
  await page.fill('input[name="email"]', testUser.email);
  await page.fill('input[name="username"]', testUser.username);
  await page.fill('input[name="password"]', testUser.password);
  await page.fill('input[name="confirmPassword"]', testUser.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for either dashboard or error
  await Promise.race([
    page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 }).catch(() => {}),
    page.waitForSelector('text="Failed to register"', { timeout: 10000 }).catch(() => {})
  ]);

  // Wait a bit more for async Firestore operations
  await page.waitForTimeout(2000);

  // Print all console messages
  console.log('\n========================================');
  console.log('📋 CONSOLE LOGS DURING SIGNUP:');
  console.log('========================================\n');

  consoleMessages.forEach(msg => {
    console.log(msg);
  });

  console.log('\n========================================');
  console.log('🎯 KEY FINDINGS:');
  console.log('========================================\n');

  // Check for key Firestore-related logs
  const firestoreCreateLog = consoleMessages.find(m => m.includes('🔥 Creating Firestore user document'));
  const firestoreSuccessLog = consoleMessages.find(m => m.includes('✅ Firestore user document created'));
  const firestoreErrorLog = consoleMessages.find(m => m.includes('❌ Failed to create Firestore document'));
  const offlineError = consoleMessages.find(m => m.includes('client is offline'));
  const authContextFetch = consoleMessages.find(m => m.includes('AuthContext: Firestore doc fetched'));
  const firestoreData = consoleMessages.find(m => m.includes('✅ Firestore userData:'));

  console.log(`Test User: ${testUser.username} (${testUser.email})`);
  console.log(`\nCurrent URL: ${page.url()}`);
  console.log(`\n✓ setDoc() call initiated: ${firestoreCreateLog ? 'YES' : 'NO'}`);
  console.log(`✓ setDoc() success log: ${firestoreSuccessLog ? 'YES' : 'NO'}`);
  console.log(`✓ setDoc() error log: ${firestoreErrorLog ? 'YES' : 'NO'}`);
  console.log(`✓ Offline error detected: ${offlineError ? 'YES' : 'NO'}`);
  console.log(`✓ AuthContext fetch attempt: ${authContextFetch ? 'YES' : 'NO'}`);
  console.log(`✓ Firestore data retrieved: ${firestoreData ? 'YES' : 'NO'}`);

  if (consoleErrors.length > 0) {
    console.log('\n❌ CONSOLE ERRORS:');
    consoleErrors.forEach(err => console.log(`  - ${err}`));
  }

  console.log('\n========================================\n');

  // Make assertions
  expect(page.url()).toBe(`${BASE_URL}/dashboard`);

  // The test passes regardless, we just want to see the logs
});
