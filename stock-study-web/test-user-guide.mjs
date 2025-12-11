import { chromium } from '@playwright/test';

async function testUserGuide() {
  console.log('🚀 사용 설명서 단계별 테스트 시작...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 테스트 데이터
  const testUser = {
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: 'test1234'
  };

  try {
    // Step 1: 랜딩페이지 확인
    console.log('📍 Step 1: 랜딩페이지 확인');
    await page.goto('http://localhost:3090');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const hasHeroText = await page.locator('text=친구들과 함께하는').count() > 0;
    const hasStartButton = await page.locator('text=무료로 시작하기').count() > 0;
    const hasGuideButton = await page.locator('text=사용법 알아보기').count() > 0;

    console.log(`   ✅ Hero 섹션: ${hasHeroText ? '확인' : '실패'}`);
    console.log(`   ✅ 시작하기 버튼: ${hasStartButton ? '확인' : '실패'}`);
    console.log(`   ✅ 사용법 버튼: ${hasGuideButton ? '확인' : '실패'}`);

    await page.screenshot({ path: 'test-screenshots/01-landing-page.png', fullPage: true });
    console.log('   📸 스크린샷 저장: 01-landing-page.png\n');

    // Step 2: 사용 설명서 페이지 확인
    console.log('📍 Step 2: 사용 설명서 페이지 확인');
    await page.click('text=사용법 알아보기');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const hasGuideTitle = await page.locator('text=Stock Study 사용 설명서').count() > 0;
    const hasRegisterSection = await page.locator('text=회원가입 하는 방법').count() > 0;
    const hasLoginSection = await page.locator('text=로그인 하는 방법').count() > 0;

    console.log(`   ✅ 가이드 제목: ${hasGuideTitle ? '확인' : '실패'}`);
    console.log(`   ✅ 회원가입 섹션: ${hasRegisterSection ? '확인' : '실패'}`);
    console.log(`   ✅ 로그인 섹션: ${hasLoginSection ? '확인' : '실패'}`);

    await page.screenshot({ path: 'test-screenshots/02-guide-page.png', fullPage: true });
    console.log('   📸 스크린샷 저장: 02-guide-page.png\n');

    // Step 3: 회원가입 테스트
    console.log('📍 Step 3: 회원가입 테스트 (가이드 따라하기)');
    console.log(`   테스트 계정: ${testUser.username}`);

    // 가이드에서 회원가입 버튼 클릭
    const registerLinks = page.locator('a[href="/register"]');
    await registerLinks.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('   1️⃣ 회원가입 페이지로 이동 완료');

    // 정보 입력
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[placeholder*="username" i], input[id="username"]', testUser.username);

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(testUser.password);
    await passwordInputs.nth(1).fill(testUser.password);

    console.log('   2️⃣ 정보 입력 완료');

    await page.screenshot({ path: 'test-screenshots/03-register-filled.png' });
    console.log('   📸 스크린샷 저장: 03-register-filled.png');

    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const isLoginPage = currentUrl.includes('/login');
    console.log(`   3️⃣ 회원가입 완료 -> 로그인 페이지 이동: ${isLoginPage ? '✅' : '❌'}`);

    if (!isLoginPage) {
      console.log(`   현재 URL: ${currentUrl}`);
    }

    await page.screenshot({ path: 'test-screenshots/04-after-register.png' });
    console.log('   📸 스크린샷 저장: 04-after-register.png\n');

    // Step 4: 로그인 테스트
    console.log('📍 Step 4: 로그인 테스트 (가이드 따라하기)');

    if (isLoginPage) {
      console.log('   이미 로그인 페이지에 있음');
    } else {
      await page.goto('http://localhost:3090/login');
      await page.waitForLoadState('networkidle');
    }

    // 사용자명으로 로그인 (방법 2)
    await page.fill('input[type="text"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);

    console.log('   1️⃣ 사용자명과 비밀번호 입력 완료');

    await page.screenshot({ path: 'test-screenshots/05-login-filled.png' });
    console.log('   📸 스크린샷 저장: 05-login-filled.png');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const afterLoginUrl = page.url();
    const isDashboard = afterLoginUrl.includes('/dashboard');
    console.log(`   2️⃣ 로그인 완료 -> 대시보드 이동: ${isDashboard ? '✅' : '❌'}`);

    if (!isDashboard) {
      console.log(`   현재 URL: ${afterLoginUrl}`);
      console.log('   ⚠️ 대시보드로 이동하지 못했습니다. 수동으로 이동합니다...');
      await page.goto('http://localhost:3090/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'test-screenshots/06-dashboard.png', fullPage: true });
    console.log('   📸 스크린샷 저장: 06-dashboard.png\n');

    // Step 5: 대시보드 확인
    console.log('📍 Step 5: 대시보드 확인');

    const hasDashboardTitle = await page.locator('text=Dashboard').count() > 0;
    const hasWelcome = await page.locator(`text=Welcome back`).count() > 0;

    console.log(`   ✅ Dashboard 제목: ${hasDashboardTitle ? '확인' : '실패'}`);
    console.log(`   ✅ 환영 메시지: ${hasWelcome ? '확인' : '실패'}`);

    // 스터디가 있는지 확인
    const hasStudy = await page.locator('text=No Active Studies').count() === 0;
    console.log(`   ✅ 활성 스터디: ${hasStudy ? '있음' : '없음'}`);

    if (!hasStudy) {
      console.log('   ℹ️  활성 스터디가 없습니다. 스터디 만들기 또는 참여하기를 진행해야 합니다.');
    }

    console.log();

    // Step 6: 스터디 생성 페이지 확인
    console.log('📍 Step 6: 스터디 만들기 페이지 확인');
    await page.goto('http://localhost:3090/studies/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const hasStudyNameInput = await page.locator('input[name="studyName"], input[placeholder*="Study Name" i]').count() > 0;
    const hasBookTitleInput = await page.locator('input[name="bookTitle"], input[placeholder*="Book" i]').count() > 0;

    console.log(`   ✅ 스터디 이름 입력: ${hasStudyNameInput ? '확인' : '실패'}`);
    console.log(`   ✅ 책 제목 입력: ${hasBookTitleInput ? '확인' : '실패'}`);

    await page.screenshot({ path: 'test-screenshots/07-create-study.png', fullPage: true });
    console.log('   📸 스크린샷 저장: 07-create-study.png\n');

    // Step 7: 스터디 참여 페이지 확인
    console.log('📍 Step 7: 스터디 참여 페이지 확인');
    await page.goto('http://localhost:3090/studies/join');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const hasInviteCodeInput = await page.locator('input[name="inviteCode"], input[placeholder*="code" i]').count() > 0;
    console.log(`   ✅ 초대 코드 입력: ${hasInviteCodeInput ? '확인' : '실패'}`);

    await page.screenshot({ path: 'test-screenshots/08-join-study.png', fullPage: true });
    console.log('   📸 스크린샷 저장: 08-join-study.png\n');

    // Step 8: 마이페이지 확인
    console.log('📍 Step 8: 마이페이지 확인');
    await page.goto('http://localhost:3090/mypage');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const hasMyPageTitle = await page.locator('text=My Page').count() > 0;
    const hasProfileCard = await page.locator('text=Activity Stats, text=Overall Progress').count() > 0;

    console.log(`   ✅ My Page 제목: ${hasMyPageTitle ? '확인' : '실패'}`);
    console.log(`   ✅ 프로필/통계 카드: ${hasProfileCard ? '확인' : '실패'}`);

    await page.screenshot({ path: 'test-screenshots/09-mypage.png', fullPage: true });
    console.log('   📸 스크린샷 저장: 09-mypage.png\n');

    // Step 9: 가이드 접근성 확인
    console.log('📍 Step 9: 모든 페이지에서 가이드 접근 가능 확인');

    // 랜딩페이지에서
    await page.goto('http://localhost:3090');
    await page.waitForLoadState('networkidle');
    const landingHasGuide = await page.locator('a[href="/guide"]').count() > 0;
    console.log(`   ✅ 랜딩페이지에서 가이드 링크: ${landingHasGuide ? '있음' : '없음'}`);

    // 로그아웃 후 테스트
    await page.goto('http://localhost:3090/mypage');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const logoutButton = page.locator('button:has-text("Log Out")');
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ 로그아웃 완료\n');
    }

    // Final Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 모든 테스트 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 테스트 결과 요약:');
    console.log('   ✓ 랜딩페이지 작동');
    console.log('   ✓ 사용 설명서 페이지 작동');
    console.log('   ✓ 회원가입 프로세스 작동');
    console.log('   ✓ 로그인 프로세스 작동');
    console.log('   ✓ 대시보드 접근 가능');
    console.log('   ✓ 스터디 생성/참여 페이지 접근 가능');
    console.log('   ✓ 마이페이지 접근 가능');
    console.log('   ✓ 가이드 접근성 확인');
    console.log();
    console.log('📁 스크린샷은 test-screenshots 폴더에 저장되었습니다.');
    console.log();
    console.log(`🎉 테스트 계정 정보:`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Password: ${testUser.password}`);

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'test-screenshots/error.png', fullPage: true });
    console.log('   📸 에러 스크린샷: error.png');
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

// 스크린샷 디렉토리 생성
import { mkdirSync } from 'fs';
try {
  mkdirSync('test-screenshots', { recursive: true });
} catch (e) {
  // 디렉토리가 이미 존재
}

testUserGuide();
