import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 직접 파싱
function loadEnv() {
  const envPath = join(__dirname, '.env.local');
  const envFile = readFileSync(envPath, 'utf8');
  const env = {};

  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

const env = loadEnv();

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Firebase 설정:');
console.log(`   Project ID: ${firebaseConfig.projectId}`);
console.log(`   Auth Domain: ${firebaseConfig.authDomain}`);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCollection(collectionName, expectedCount = null) {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📂 Collection: ${collectionName}`);
    console.log(`${'='.repeat(70)}`);
    console.log(`📊 문서 개수: ${snapshot.size}개`);

    if (expectedCount !== null) {
      if (snapshot.size >= expectedCount) {
        console.log(`✅ 예상 개수 충족 (최소 ${expectedCount}개 필요)`);
      } else {
        console.log(`⚠️  예상보다 적음 (최소 ${expectedCount}개 필요, 현재 ${snapshot.size}개)`);
      }
    }

    if (snapshot.empty) {
      console.log('❌ 컬렉션이 비어있습니다!');
      return [];
    }

    const docs = [];
    let displayCount = 0;
    const maxDisplay = 3; // 처음 3개만 상세 표시

    snapshot.forEach((doc) => {
      const data = doc.data();
      docs.push({ id: doc.id, ...data });

      if (displayCount < maxDisplay) {
        // 타임스탬프를 읽기 쉬운 형식으로 변환
        const displayData = { ...data };
        Object.keys(displayData).forEach(key => {
          if (displayData[key]?.toDate) {
            displayData[key] = displayData[key].toDate().toISOString().replace('T', ' ').substring(0, 19);
          }
        });

        console.log(`\n📄 문서 ID: ${doc.id}`);

        // 주요 필드만 표시
        if (collectionName === 'users') {
          console.log(`   username: ${displayData.username || 'N/A'}`);
          console.log(`   email: ${displayData.email || 'N/A'}`);
          console.log(`   createdAt: ${displayData.createdAt || 'N/A'}`);
        } else if (collectionName === 'studies') {
          console.log(`   studyName: ${displayData.studyName || 'N/A'}`);
          console.log(`   inviteCode: ${displayData.inviteCode || 'N/A'}`);
          console.log(`   bookTitle: ${displayData.bookTitle || 'N/A'}`);
          console.log(`   maxMembers: ${displayData.maxMembers || 'N/A'}`);
          console.log(`   status: ${displayData.status || 'N/A'}`);
        } else if (collectionName === 'studyMembers') {
          console.log(`   studyId: ${displayData.studyId || 'N/A'}`);
          console.log(`   userId: ${displayData.userId || 'N/A'}`);
          console.log(`   role: ${displayData.role || 'N/A'}`);
        } else if (collectionName === 'dayPlans') {
          console.log(`   dayNumber: ${displayData.dayNumber || 'N/A'}`);
          console.log(`   title: ${displayData.title || 'N/A'}`);
          console.log(`   learningGoal: ${displayData.learningGoal?.substring(0, 50) || 'N/A'}...`);
        } else if (collectionName === 'assignments') {
          console.log(`   questionText: ${displayData.questionText?.substring(0, 60) || 'N/A'}...`);
          console.log(`   questionOrder: ${displayData.questionOrder || 'N/A'}`);
          console.log(`   isRequired: ${displayData.isRequired}`);
        }

        displayCount++;
      }
    });

    if (snapshot.size > maxDisplay) {
      console.log(`\n   ... 외 ${snapshot.size - maxDisplay}개 문서 (상세 내용 생략)`);
    }

    return docs;
  } catch (error) {
    console.error(`❌ ${collectionName} 조회 실패:`, error.message);
    return [];
  }
}

async function checkFirestoreData() {
  console.log('\n🔍 Firestore 데이터 조회 시작...\n');

  try {
    // 1. Users 컬렉션
    const users = await checkCollection('users', 1);

    // 2. Studies 컬렉션
    const studies = await checkCollection('studies', 1);

    // 3. StudyMembers 컬렉션
    const studyMembers = await checkCollection('studyMembers', 1);

    // 4. DayPlans 컬렉션
    const dayPlans = await checkCollection('dayPlans', 15);

    // 5. Assignments 컬렉션
    const assignments = await checkCollection('assignments', 45);

    // 요약
    console.log('\n' + '='.repeat(70));
    console.log('📊 Firestore 데이터 요약');
    console.log('='.repeat(70));
    console.log(`users:        ${users.length}개`);
    console.log(`studies:      ${studies.length}개`);
    console.log(`studyMembers: ${studyMembers.length}개`);
    console.log(`dayPlans:     ${dayPlans.length}개 ${dayPlans.length >= 15 ? '✅' : '⚠️ (예상: 15개)'}`);
    console.log(`assignments:  ${assignments.length}개 ${assignments.length >= 45 ? '✅' : '⚠️ (예상: 45개)'}`);

    // 가장 최근 스터디 정보 출력
    if (studies.length > 0) {
      const latestStudy = studies[studies.length - 1];
      console.log('\n' + '='.repeat(70));
      console.log('🎯 가장 최근 생성된 스터디');
      console.log('='.repeat(70));
      console.log(`📚 스터디명:   ${latestStudy.studyName}`);
      console.log(`🎫 초대 코드:  ${latestStudy.inviteCode}`);
      console.log(`📖 책 제목:    ${latestStudy.bookTitle}`);
      console.log(`👥 최대 인원:  ${latestStudy.maxMembers}명`);
      console.log(`📌 상태:      ${latestStudy.status}`);
      console.log(`🆔 Study ID:  ${latestStudy.id}`);
    }

    // DayPlans 요약
    if (dayPlans.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('📅 15일 학습 계획 확인');
      console.log('='.repeat(70));

      const dayNumbers = dayPlans.map(p => p.dayNumber).sort((a, b) => a - b);
      console.log(`Day 범위: ${Math.min(...dayNumbers)} ~ ${Math.max(...dayNumbers)}`);

      if (dayPlans.length >= 3) {
        console.log('\n샘플 (처음 3개):');
        dayPlans.slice(0, 3).forEach(plan => {
          console.log(`  Day ${plan.dayNumber}: ${plan.title}`);
        });
      }
    }

    console.log('\n' + '='.repeat(70));

    if (users.length > 0 && studies.length > 0 && dayPlans.length >= 15 && assignments.length >= 45) {
      console.log('✅ Firestore 연동 성공!');
      console.log('🎉 모든 데이터가 정상적으로 저장되었습니다!');
    } else if (users.length > 0 && studies.length > 0) {
      console.log('✅ Firestore 연동 성공!');
      console.log('⚠️  일부 데이터가 누락되었을 수 있습니다.');
      console.log('   (스터디 생성 시 15일 계획 + 45개 과제가 자동 생성됩니다)');
    } else {
      console.log('⚠️  아직 생성된 데이터가 없습니다.');
      console.log('   웹 앱에서 회원가입 후 스터디를 생성해보세요.');
    }
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ 데이터 조회 중 오류 발생:', error);
    throw error;
  }
}

checkFirestoreData()
  .then(() => {
    console.log('\n✅ 스크립트 실행 완료\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
