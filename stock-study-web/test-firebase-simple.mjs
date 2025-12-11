import { chromium } from 'playwright';

async function testFirebaseIntegration() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 콘솔 로그 캡처
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('Study created') ||
        text.includes('studyId') ||
        text.includes('inviteCode') ||
        text.includes('Error') ||
        text.includes('error')) {
      console.log('🔍 중요 로그:', text);
    }
  });

  page.on('pageerror', err => {
    console.error('❌ 페이지 에러:', err.message);
  });

  try {
    console.log('\n📝 Step 1: 회원가입...');
    await page.goto('http://localhost:3090/register', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="username"]', { timeout: 5000 });

    const timestamp = Date.now();
    const testUser = {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'Test1234!'
    };

    console.log(`   사용자: ${testUser.email}`);
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.screenshot({ path: 'screenshots/firebase-simple-01-register.png', fullPage: true });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('   ✅ 회원가입 완료');

    console.log('\n📚 Step 2: 스터디 생성 페이지 이동...');
    await page.goto('http://localhost:3090/studies/create', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="studyName"]', { timeout: 5000 });
    await page.screenshot({ path: 'screenshots/firebase-simple-02-create-page.png', fullPage: true });
    console.log('   ✅ 페이지 로드됨');

    console.log('\n✍️  Step 3: 스터디 정보 입력...');
    const studyData = {
      studyName: `Firebase Test ${timestamp}`,
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
    await page.screenshot({ path: 'screenshots/firebase-simple-03-filled.png', fullPage: true });
    console.log('   ✅ 정보 입력 완료');

    console.log('\n🚀 Step 4: 스터디 생성...');

    let inviteCode = null;
    let alertMessage = null;

    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      console.log('\n📢 Alert 메시지:');
      console.log(alertMessage);

      const codeMatch = alertMessage.match(/Invite Code:\s*([A-Z0-9]{8})/);
      if (codeMatch) {
        inviteCode = codeMatch[1];
        console.log(`\n🎫 초대 코드 추출: ${inviteCode}`);
      }

      await dialog.accept();
    });

    await page.click('button[type="submit"]:has-text("Create Study")');
    console.log('   ⏳ Firestore에 데이터 저장 중...');

    // Firestore 작업 완료 대기
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'screenshots/firebase-simple-04-after-submit.png', fullPage: true });

    console.log('\n' + '='.repeat(70));
    console.log('📊 테스트 결과');
    console.log('='.repeat(70));
    console.log('✅ 테스트 계정:', testUser.email);
    console.log('✅ 스터디명:', studyData.studyName);

    if (inviteCode) {
      console.log('✅ 초대 코드:', inviteCode);
      console.log('✅ Firestore 저장: 성공! (초대 코드가 생성됨)');
    } else if (alertMessage) {
      console.log('⚠️  Alert 표시:', alertMessage.substring(0, 50) + '...');
      console.log('❓ 초대 코드 미확인 - Alert 형식을 확인해주세요');
    } else {
      console.log('❌ Alert 미표시 - Firestore 저장 실패 가능성');
    }

    console.log('\n📋 Firebase 관련 콘솔 로그:');
    const firebaseLogs = consoleLogs.filter(log =>
      log.includes('Study') ||
      log.includes('studyId') ||
      log.includes('inviteCode') ||
      log.toLowerCase().includes('error')
    );

    if (firebaseLogs.length > 0) {
      firebaseLogs.forEach(log => console.log('  -', log));
    } else {
      console.log('  (Firebase 관련 로그 없음)');
    }

    console.log('\n' + '='.repeat(70));
    console.log('🔍 Firebase Console에서 확인하기');
    console.log('='.repeat(70));
    console.log('URL: https://console.firebase.google.com/project/stock-study-15/firestore');
    console.log('\n확인할 컬렉션:');
    console.log('  1. users (1개) - 사용자 정보');
    console.log('  2. studies (1개) - 스터디 정보 + inviteCode');
    console.log('  3. studyMembers (1개) - 멤버십');
    console.log('  4. dayPlans (15개) - Day 1~15 학습계획');
    console.log('  5. assignments (45개) - 과제 (각 Day당 3개)');
    console.log('='.repeat(70));

    console.log('\n⏳ 15초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('\n❌ 테스트 에러:', error.message);
    await page.screenshot({ path: 'screenshots/firebase-simple-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

console.log('🧪 Firebase Firestore 연동 테스트\n');
testFirebaseIntegration()
  .then(() => {
    console.log('\n✅ 테스트 완료!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ 테스트 실패:', err);
    process.exit(1);
  });
