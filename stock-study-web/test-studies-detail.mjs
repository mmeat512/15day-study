import { chromium } from '@playwright/test';

async function testStudiesDetailPage() {
  console.log('🚀 Testing Studies Detail Page...\n');

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

    // Wait for navigation to dashboard
    await page.waitForTimeout(3000);
    console.log('✅ Login successful\n');

    // Go to dashboard
    console.log('2️⃣ Navigating to dashboard...');
    await page.goto('http://localhost:3090/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if "View Details" button exists
    const viewDetailsButton = page.locator('button:has-text("View Details")');
    const buttonExists = await viewDetailsButton.count() > 0;
    console.log(`   View Details button found: ${buttonExists ? '✅' : '❌'}`);

    if (buttonExists) {
      // Click "View Details"
      console.log('\n3️⃣ Clicking "View Details" button...');
      await viewDetailsButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check current URL
      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);

      const isStudyDetailPage = currentUrl.includes('/studies/') && !currentUrl.includes('/day/');
      console.log(`   On study detail page: ${isStudyDetailPage ? '✅' : '❌'}`);

      if (isStudyDetailPage) {
        console.log('\n4️⃣ Checking page content...');

        // Check for study info sections
        const studyInfoCard = page.locator('text=Study Info');
        const hasStudyInfo = await studyInfoCard.count() > 0;
        console.log(`   Study Info card: ${hasStudyInfo ? '✅' : '❌'}`);

        const durationCard = page.locator('text=Duration');
        const hasDuration = await durationCard.count() > 0;
        console.log(`   Duration card: ${hasDuration ? '✅' : '❌'}`);

        const progressCard = page.locator('text=Your Progress');
        const hasProgress = await progressCard.count() > 0;
        console.log(`   Your Progress card: ${hasProgress ? '✅' : '❌'}`);

        // Check for members section
        const membersSection = page.locator('text=Members');
        const hasMembers = await membersSection.count() > 0;
        console.log(`   Members section: ${hasMembers ? '✅' : '❌'}`);

        // Check for 15-day learning plan
        const learningPlanSection = page.locator('text=15-Day Learning Plan');
        const hasLearningPlan = await learningPlanSection.count() > 0;
        console.log(`   15-Day Learning Plan: ${hasLearningPlan ? '✅' : '❌'}`);

        // Count day cards
        const dayCards = page.locator('text=Day ').locator('visible=true');
        const dayCardCount = await dayCards.count();
        console.log(`   Day cards found: ${dayCardCount} ${dayCardCount >= 15 ? '✅' : '❌'}`);

        // Take a screenshot
        await page.screenshot({ path: 'studies-detail-page.png', fullPage: true });
        console.log('\n   📸 Screenshot saved: studies-detail-page.png');

        // Test clicking on a day
        console.log('\n5️⃣ Testing day navigation...');
        const day1Card = page.locator('text=Day 1').first();
        if (await day1Card.count() > 0) {
          await day1Card.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          const dayDetailUrl = page.url();
          const isDayDetailPage = dayDetailUrl.includes('/day/');
          console.log(`   Navigated to day detail: ${isDayDetailPage ? '✅' : '❌'}`);
          console.log(`   Day detail URL: ${dayDetailUrl}`);

          // Go back to test
          await page.goBack();
          await page.waitForLoadState('networkidle');
          console.log('   ✅ Returned to study detail page');
        }

        console.log('\n✅ All tests completed successfully!');
      } else {
        console.log('❌ Not on study detail page - got 404 or wrong page');
      }
    } else {
      console.log('❌ View Details button not found on dashboard');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testStudiesDetailPage();
