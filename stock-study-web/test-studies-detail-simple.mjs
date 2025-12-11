import { chromium } from '@playwright/test';

async function testStudiesDetailSimple() {
  console.log('🚀 Testing Studies Detail Page (Simple)...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

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

    // Go to dashboard
    console.log('2️⃣ Navigating to dashboard...');
    await page.goto('http://localhost:3090/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of dashboard
    await page.screenshot({ path: 'dashboard-before-click.png' });
    console.log('   📸 Dashboard screenshot saved\n');

    // Try to find any link that contains /studies/
    const studyLinks = page.locator('a[href*="/studies/"]');
    const linkCount = await studyLinks.count();
    console.log(`   Found ${linkCount} study links`);

    if (linkCount > 0) {
      // Get the first study link
      const firstLink = studyLinks.first();
      const href = await firstLink.getAttribute('href');
      console.log(`   First link href: ${href}\n`);

      // Navigate directly to the study detail page
      if (href && !href.includes('/day/') && !href.includes('/create') && !href.includes('/join')) {
        console.log('3️⃣ Navigating to study detail page...');
        await page.goto(`http://localhost:3090${href}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        const currentUrl = page.url();
        console.log(`   Current URL: ${currentUrl}`);

        // Check page content
        console.log('\n4️⃣ Checking page content...');

        const pageText = await page.textContent('body');

        const hasStudyInfo = pageText.includes('Study Info');
        const hasDuration = pageText.includes('Duration');
        const hasProgress = pageText.includes('Your Progress');
        const hasMembers = pageText.includes('Members');
        const hasLearningPlan = pageText.includes('15-Day Learning Plan') || pageText.includes('Day 1');

        console.log(`   Study Info: ${hasStudyInfo ? '✅' : '❌'}`);
        console.log(`   Duration: ${hasDuration ? '✅' : '❌'}`);
        console.log(`   Your Progress: ${hasProgress ? '✅' : '❌'}`);
        console.log(`   Members: ${hasMembers ? '✅' : '❌'}`);
        console.log(`   Learning Plan: ${hasLearningPlan ? '✅' : '❌'}`);

        // Take screenshot
        await page.screenshot({ path: 'studies-detail-page.png', fullPage: true });
        console.log('\n   📸 Screenshot saved: studies-detail-page.png');

        if (hasStudyInfo && hasDuration && hasProgress && hasMembers && hasLearningPlan) {
          console.log('\n✅ Study detail page is working correctly!');
        } else {
          console.log('\n⚠️  Some elements are missing on the page');
        }
      }
    } else {
      console.log('❌ No study links found on dashboard');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    // Keep browser open for 5 seconds to see the result
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testStudiesDetailSimple();
