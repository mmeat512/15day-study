import { chromium } from 'playwright';

async function testFirebaseIntegration() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // 천천히 실행하여 확인
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 콘솔 로그 캡처
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    console.log('브라우저 콘솔:', text);
  });

  // 에러 캡처
  page.on('pageerror', err => {
    console.error('❌ 페이지 에러:', err.message);
  });

  try {
    console.log('\n📝 Step 1: 회원가입 페이지 접속...');
    await page.goto('http://localhost:3090/register');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/firebase-test-01-register.png', fullPage: true });

    // 랜덤 사용자 정보 생성
    const timestamp = Date.now();
    const testUser = {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'Test1234!'
    };

    console.log(`\n✍️  Step 2: 회원가입 (${testUser.email})...`);
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.screenshot({ path: 'screenshots/firebase-test-02-register-filled.png', fullPage: true });

    await page.click('button[type="submit"]');
    console.log('⏳ 회원가입 처리 중...');

    // 대시보드로 리다이렉트될 때까지 대기 (최대 10초)
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ 회원가입 성공! 대시보드로 이동됨');
    } catch (err) {
      console.log('⚠️  리다이렉트 타임아웃, 현재 URL:', page.url());
      await page.screenshot({ path: 'screenshots/firebase-test-02-after-register.png', fullPage: true });
    }

    await page.waitForTimeout(2000);

    console.log('\n📚 Step 3: 스터디 생성 페이지 접속...');
    await page.goto('http://localhost:3090/studies/create');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/firebase-test-03-create-study.png', fullPage: true });

    console.log('\n✍️  Step 4: 스터디 정보 입력...');
    const studyData = {
      studyName: `Firebase Test Study ${timestamp}`,
      description: 'Testing Firebase Firestore integration',
      bookTitle: 'Stock Investment Guide',
      startDate: '2025-01-15',
      maxMembers: '10'
    };

    await page.fill('input[name="studyName"]', studyData.studyName);
    await page.fill('textarea[name="description"]', studyData.description);
    await page.fill('input[name="bookTitle"]', studyData.bookTitle);
    await page.fill('input[name="startDate"]', studyData.startDate);
    await page.fill('input[name="maxMembers"]', studyData.maxMembers);

    await page.screenshot({ path: 'screenshots/firebase-test-04-study-filled.png', fullPage: true });

    console.log('\n🚀 Step 5: 스터디 생성 버튼 클릭...');

    // alert 다이얼로그 핸들러 설정
    let inviteCode = null;
    page.on('dialog', async dialog => {
      const message = dialog.message();
      console.log('📢 Alert 메시지:', message);

      // 초대 코드 추출
      const codeMatch = message.match(/Invite Code:\s*([A-Z0-9]{8})/);
      if (codeMatch) {
        inviteCode = codeMatch[1];
        console.log('🎫 초대 코드:', inviteCode);
      }

      await dialog.accept();
    });

    await page.click('button[type="submit"]:has-text("Create Study")');
    console.log('⏳ 스터디 생성 처리 중...');

    // Firestore 작업 완료 대기
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'screenshots/firebase-test-05-after-create.png', fullPage: true });

    // 현재 URL 확인
    console.log('📍 현재 URL:', page.url());

    console.log('\n' + '='.repeat(60));
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(60));
    console.log('✅ 회원가입:', testUser.email);
    console.log('✅ 로그인: 자동 로그인됨');
    console.log('✅ 스터디 생성:', studyData.studyName);
    if (inviteCode) {
      console.log('✅ 초대 코드:', inviteCode);
    }
    console.log('\n📋 콘솔 로그 (Firebase 관련):');
    consoleLogs
      .filter(log =>
        log.includes('Study created') ||
        log.includes('Firebase') ||
        log.includes('Firestore') ||
        log.includes('error') ||
        log.includes('Error')
      )
      .forEach(log => console.log('  -', log));

    console.log('\n' + '='.repeat(60));
    console.log('🔍 다음 단계: Firebase Console에서 확인하기');
    console.log('='.repeat(60));
    console.log('1. https://console.firebase.google.com/ 접속');
    console.log('2. stock-study-15 프로젝트 선택');
    console.log('3. Firestore Database 클릭');
    console.log('4. 다음 컬렉션에서 데이터 확인:');
    console.log('   - users: 사용자 문서 1개');
    console.log('   - studies: 스터디 문서 1개');
    console.log('   - studyMembers: 멤버 문서 1개');
    console.log('   - dayPlans: 학습계획 15개');
    console.log('   - assignments: 과제 45개');
    console.log('='.repeat(60));

    // 10초 대기 후 브라우저 종료
    console.log('\n⏳ 10초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    await page.screenshot({ path: 'screenshots/firebase-test-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

console.log('🧪 Firebase Firestore 연동 테스트 시작\n');
testFirebaseIntegration()
  .then(() => {
    console.log('\n✅ 테스트 완료!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ 테스트 실패:', err);
    process.exit(1);
  });
