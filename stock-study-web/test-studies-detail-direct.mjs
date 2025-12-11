import { chromium } from '@playwright/test';

async function testStudiesDetailDirect() {
  console.log('🚀 Testing Studies Detail Page (Direct URL)...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Study IDs from Firestore
  const studyIds = ['Az2PVP4246jhMuTKFbx8', 'HhrynMeNiDAv16Kpdb5b'];

  try {
    // Login first
    console.log('1️⃣ Logging in...');
    await page.goto('http://localhost:3090/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'test1234');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);
    console.log('✅ Login successful\n');

    // Test each study
    for (const studyId of studyIds) {
      console.log(`\n2️⃣ Testing study detail page for: ${studyId}`);
      await page.goto(`http://localhost:3090/studies/${studyId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);

      // Check if we got 404 or actual page
      const pageText = await page.textContent('body');
      const is404 = pageText.includes('404') || pageText.includes('Not Found') || pageText.includes('Study Not Found');

      if (is404) {
        console.log(`   ❌ Got 404 or "Not Found" for ${studyId}`);
        continue;
      }

      // Check page content
      console.log('\n3️⃣ Checking page content...');

      const hasStudyInfo = pageText.includes('Study Info');
      const hasDuration = pageText.includes('Duration');
      const hasProgress = pageText.includes('Your Progress') || pageText.includes('Progress');
      const hasMembers = pageText.includes('Members');
      const hasLearningPlan = pageText.includes('15-Day Learning Plan') || pageText.includes('Day 1');

      console.log(`   Study Info: ${hasStudyInfo ? '✅' : '❌'}`);
      console.log(`   Duration: ${hasDuration ? '✅' : '❌'}`);
      console.log(`   Your Progress: ${hasProgress ? '✅' : '❌'}`);
      console.log(`   Members: ${hasMembers ? '✅' : '❌'}`);
      console.log(`   Learning Plan: ${hasLearningPlan ? '✅' : '❌'}`);

      // Take screenshot
      await page.screenshot({ path: `study-detail-${studyId}.png`, fullPage: true });
      console.log(`\n   📸 Screenshot saved: study-detail-${studyId}.png`);

      if (hasStudyInfo && hasDuration && hasProgress && hasMembers && hasLearningPlan) {
        console.log(`\n✅ Study detail page for ${studyId} is working correctly!`);

        // Test clicking on Day 1
        console.log('\n4️⃣ Testing day navigation...');
        const day1Link = page.locator('a[href*="/day/1"]').first();
        if (await day1Link.count() > 0) {
          await day1Link.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          const dayUrl = page.url();
          const isDayPage = dayUrl.includes('/day/1');
          console.log(`   Navigated to Day 1: ${isDayPage ? '✅' : '❌'}`);
          console.log(`   Day URL: ${dayUrl}`);

          await page.goBack();
          await page.waitForTimeout(1000);
          console.log('   ✅ Returned to study detail page');
        }

        break; // Success, exit loop
      } else {
        console.log(`\n⚠️  Some elements are missing for ${studyId}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testStudiesDetailDirect();
