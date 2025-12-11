import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3090';

// Generate unique test user credentials with timestamp
const timestamp = Date.now();
const testUser1 = {
  email: `testuser1_${timestamp}@example.com`,
  username: `TestUser1_${timestamp}`,
  password: 'password123',
};

const testUser2 = {
  email: `testuser2_${timestamp}@example.com`,
  username: `TestUser2_${timestamp}`,
  password: 'password456',
};

// Test study data
const testStudy = {
  name: '겨울방학 주식 스터디',
  description: '주식 초보자들을 위한 기초 스터디',
  bookTitle: '주식투자 무작정 따라하기',
  startDate: '2025-01-15',
  endDate: '2025-01-29',
  maxMembers: 10,
};

let studyInviteCode = '';

test.describe('Stock Study 15-Day Tracker - Full User Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('1. 회원가입 - 첫 번째 사용자', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Wait for page to load
    await expect(page.locator('h2')).toContainText('Create an Account');

    // Fill registration form
    await page.fill('input[name="email"]', testUser1.email);
    await page.fill('input[name="username"]', testUser1.username);
    await page.fill('input[name="password"]', testUser1.password);
    await page.fill('input[name="confirmPassword"]', testUser1.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test('2. 로그인 - 첫 번째 사용자 (오류 1 확인: 로딩 표시 및 대시보드 이동)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Fill login form (using username field which accepts email or username)
    await page.fill('input[name="username"]', testUser1.email);
    await page.fill('input[name="password"]', testUser1.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Check for loading indicator (오류 1: 로딩이 보여야 함)
    // If there's a loading spinner or text, it should be visible
    const loadingIndicator = page.locator('text=로그인 중', { timeout: 1000 }).first();
    if (await loadingIndicator.isVisible().catch(() => false)) {
      console.log('✅ Loading indicator is visible');
    } else {
      console.log('⚠️  오류 1: 로딩 표시가 보이지 않음');
    }

    // Should redirect to dashboard after successful login (오류 1: 대시보드로 이동해야 함)
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
    console.log('✅ 로그인 후 대시보드로 이동 완료');
  });

  test('3. 대시보드 확인 (오류 3: 로드 속도 측정)', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', testUser1.email);
    await page.fill('input[name="password"]', testUser1.password);
    await page.click('button[type="submit"]');

    // Measure dashboard load time
    const startTime = Date.now();
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Wait for main content to load instead of networkidle
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 10000 });
    const loadTime = Date.now() - startTime;

    console.log(`📊 대시보드 로드 시간: ${loadTime}ms`);
    if (loadTime > 3000) {
      console.log(`⚠️  오류 3: 대시보드 로드 시간이 느림 (${loadTime}ms)`);
    } else {
      console.log('✅ 대시보드 로드 시간 양호');
    }

    // Check welcome message
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 5000 });
  });

  test('4. 스터디 만들기 (오류 2: undefined 값 오류 확인)', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', testUser1.email);
    await page.fill('input[name="password"]', testUser1.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to create study page
    await page.goto(`${BASE_URL}/studies/create`);

    // Wait for form to load
    await expect(page.locator('h1')).toContainText('Create', { timeout: 5000 });

    // Fill study creation form
    await page.fill('input[name="studyName"]', testStudy.name);
    await page.fill('textarea[name="description"]', testStudy.description);
    await page.fill('input[name="bookTitle"]', testStudy.bookTitle);
    await page.fill('input[name="startDate"]', testStudy.startDate);
    await page.fill('input[name="endDate"]', testStudy.endDate);
    await page.fill('input[name="maxMembers"]', testStudy.maxMembers.toString());

    // Listen for console errors (오류 2: undefined 값 확인)
    let hasUndefinedError = false;
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
        if (msg.text().includes('undefined')) {
          hasUndefinedError = true;
          console.log('⚠️  오류 2: undefined 값 발견');
        }
      }
    });

    // Listen for dialog (alert) to capture invite code
    let inviteCodeFromAlert = '';
    page.on('dialog', async dialog => {
      const message = dialog.message();
      console.log('Alert message:', message);

      // Extract invite code from alert message
      const codeMatch = message.match(/Invite Code:\s*([A-Z0-9]+)/i);
      if (codeMatch) {
        inviteCodeFromAlert = codeMatch[1];
        studyInviteCode = inviteCodeFromAlert;
        console.log(`✅ 스터디 생성 성공. 초대 코드: ${studyInviteCode}`);
      }

      await dialog.accept();
    });

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 });

    if (hasUndefinedError) {
      console.log('⚠️  오류 2: undefined 값 오류 발생');
    } else {
      console.log('✅ undefined 값 오류 없음');
    }
  });

  test('5. 회원가입 - 두 번째 사용자', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    await page.fill('input[name="email"]', testUser2.email);
    await page.fill('input[name="username"]', testUser2.username);
    await page.fill('input[name="password"]', testUser2.password);
    await page.fill('input[name="confirmPassword"]', testUser2.password);

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test('6. 로그인 - 두 번째 사용자', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="username"]', testUser2.email);
    await page.fill('input[name="password"]', testUser2.password);

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
  });

  test('7. 스터디 참여하기', async ({ page }) => {
    if (!studyInviteCode) {
      test.skip('초대 코드가 없어서 테스트를 건너뜁니다');
      return;
    }

    // Login as second user
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', testUser2.email);
    await page.fill('input[name="password"]', testUser2.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to join study page
    await page.goto(`${BASE_URL}/studies/join`);

    await expect(page.locator('h1')).toContainText('Join');

    // Fill invite code
    await page.fill('input[name="inviteCode"]', studyInviteCode);

    // Listen for success alert dialog
    let alertShown = false;
    page.on('dialog', async dialog => {
      console.log('Alert message:', dialog.message());
      if (dialog.message().includes('Successfully joined')) {
        alertShown = true;
        console.log('✅ 스터디 참여 성공 알림 확인');
      }
      await dialog.accept();
    });

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful join
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    console.log('✅ 스터디 참여 후 대시보드로 이동 완료');

    if (alertShown) {
      console.log('✅ 스터디 참여 완료');
    }
  });

  test('8. 마이페이지 확인', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', testUser1.email);
    await page.fill('input[name="password"]', testUser1.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to my page
    await page.goto(`${BASE_URL}/mypage`);

    // Check profile information
    await expect(page.locator('text=' + testUser1.username)).toBeVisible();
    await expect(page.locator('text=' + testUser1.email)).toBeVisible();
  });
});
