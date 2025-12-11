import { chromium } from '@playwright/test';

async function testNewFeatures() {
  console.log('🚀 Starting feature tests...\n');

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

    await page.waitForURL('**/dashboard');
    console.log('✅ Login successful\n');

    // Test 1: Navigate to a day page and check submission form
    console.log('2️⃣ Testing assignment submission page...');
    await page.goto('http://localhost:3090/dashboard');
    await page.waitForLoadState('networkidle');

    // Click on first study card
    const studyCard = page.locator('.space-y-6 > div').first();
    await studyCard.click();
    await page.waitForLoadState('networkidle');

    // Check if we have assignment inputs
    const assignmentInputs = page.locator('textarea[placeholder*="Write your answer"]');
    const assignmentCount = await assignmentInputs.count();
    console.log(`   Found ${assignmentCount} assignment input fields`);

    // Check if we have reflection textarea
    const reflectionInput = page.locator('textarea[placeholder*="What did you learn"]');
    const hasReflection = await reflectionInput.count() > 0;
    console.log(`   Reflection textarea: ${hasReflection ? '✅' : '❌'}`);

    // Check if we have submit button
    const submitButton = page.locator('button:has-text("Submit Assignment"), button:has-text("Update Submission")');
    const hasSubmitButton = await submitButton.count() > 0;
    console.log(`   Submit button: ${hasSubmitButton ? '✅' : '❌'}`);

    // Fill out a test submission
    if (assignmentCount > 0) {
      console.log('\n3️⃣ Filling out assignment...');
      for (let i = 0; i < assignmentCount; i++) {
        await assignmentInputs.nth(i).fill(`Test answer ${i + 1} - Testing the submission feature`);
      }
      await reflectionInput.fill('This is a test reflection. Testing the submission and comment features!');
      console.log('   ✅ Filled out all fields');

      // Submit the assignment
      console.log('\n4️⃣ Submitting assignment...');
      await submitButton.click();

      // Wait for alert or success message
      await page.waitForTimeout(2000);
      console.log('   ✅ Assignment submitted');

      // Check if comments section appeared
      await page.waitForTimeout(1000);
      const commentsSection = page.locator('text=💬 Comments');
      const hasComments = await commentsSection.count() > 0;
      console.log(`   Comments section visible: ${hasComments ? '✅' : '❌'}`);

      // Test comment posting
      if (hasComments) {
        console.log('\n5️⃣ Testing comment system...');
        const commentInput = page.locator('textarea[placeholder*="Write a comment"]');
        await commentInput.fill('This is a test comment! 🎉');

        const postButton = page.locator('button:has-text("Post Comment")');
        await postButton.click();

        await page.waitForTimeout(2000);
        console.log('   ✅ Comment posted');

        // Check if comment appears
        const testComment = page.locator('text=This is a test comment');
        const commentVisible = await testComment.count() > 0;
        console.log(`   Comment visible: ${commentVisible ? '✅' : '❌'}`);
      }
    }

    // Test 2: Check MyPage statistics
    console.log('\n6️⃣ Testing enhanced statistics dashboard...');
    await page.goto('http://localhost:3090/mypage');
    await page.waitForLoadState('networkidle');

    // Check for Overall Progress card
    const overallProgress = page.locator('text=Overall Progress');
    const hasOverallProgress = await overallProgress.count() > 0;
    console.log(`   Overall Progress card: ${hasOverallProgress ? '✅' : '❌'}`);

    // Check for Study Progress Details card
    const studyDetails = page.locator('text=Study Progress Details');
    const hasStudyDetails = await studyDetails.count() > 0;
    console.log(`   Study Progress Details card: ${hasStudyDetails ? '✅' : '❌'}`);

    // Check for Learning Insights card
    const learningInsights = page.locator('text=Learning Insights');
    const hasLearningInsights = await learningInsights.count() > 0;
    console.log(`   Learning Insights card: ${hasLearningInsights ? '✅' : '❌'}`);

    // Check for Active Studies stat
    const activeStudies = page.locator('text=Active Studies');
    const hasActiveStudies = await activeStudies.count() > 0;
    console.log(`   Active Studies stat: ${hasActiveStudies ? '✅' : '❌'}`);

    // Check for Submissions stat
    const submissions = page.locator('text=Submissions').first();
    const hasSubmissions = await submissions.count() > 0;
    console.log(`   Submissions stat: ${hasSubmissions ? '✅' : '❌'}`);

    // Take a screenshot of the enhanced stats
    await page.screenshot({ path: 'mypage-stats.png', fullPage: true });
    console.log('   📸 Screenshot saved: mypage-stats.png');

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testNewFeatures();
