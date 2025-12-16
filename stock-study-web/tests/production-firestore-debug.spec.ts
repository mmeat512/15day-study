import { test, expect } from '@playwright/test';

// Test on PRODUCTION (latest deployment)
const BASE_URL = 'https://stock-study-r178esr3c-mmeat512s-projects.vercel.app';

test('Debug Firestore on PRODUCTION - Vercel deployment', async ({ page }) => {
  const timestamp = Date.now();
  const testUser = {
    email: `prod_debug_${timestamp}@example.com`,
    username: `ProdDebug_${timestamp}`,
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

  console.log('\n========================================');
  console.log('🌐 TESTING ON PRODUCTION (VERCEL)');
  console.log('========================================\n');

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
    page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 }).catch(() => {}),
    page.waitForSelector('text="Failed to register"', { timeout: 15000 }).catch(() => {})
  ]);

  // Wait more for async Firestore operations on production
  await page.waitForTimeout(3000);

  // Print all console messages
  console.log('\n========================================');
  console.log('📋 PRODUCTION CONSOLE LOGS:');
  console.log('========================================\n');

  consoleMessages.forEach(msg => {
    console.log(msg);
  });

  console.log('\n========================================');
  console.log('🎯 PRODUCTION KEY FINDINGS:');
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
  console.log(`✓ Offline error detected: ${offlineError ? 'YES - THIS IS THE PROBLEM!' : 'NO'}`);
  console.log(`✓ AuthContext fetch attempt: ${authContextFetch ? 'YES' : 'NO'}`);
  console.log(`✓ Firestore data retrieved: ${firestoreData ? 'YES' : 'NO'}`);

  if (consoleErrors.length > 0) {
    console.log('\n❌ CONSOLE ERRORS ON PRODUCTION:');
    consoleErrors.forEach(err => console.log(`  - ${err}`));
  }

  if (offlineError) {
    console.log('\n⚠️  CRITICAL: Offline error detected on production!');
    console.log('This means experimentalForceLongPolling is not working properly.');
  }

  console.log('\n========================================\n');

  // Make assertions
  expect(page.url()).toBe(`${BASE_URL}/dashboard`);
});
