# 🔥 Firebase 설정 가이드

## 문제 해결: 데이터가 저장되지 않는 경우

### 현재 상태

✅ **해결 완료!**

이전에는 Firebase Authentication만 연동되어 있고, Firestore 데이터베이스에 스터디, 과제 등의 데이터가 저장되지 않았습니다.

이제 다음 기능들이 완전히 Firebase Firestore에 연동되었습니다:
- ✅ 사용자 회원가입 및 로그인
- ✅ 스터디 생성 (15일 학습 계획 자동 생성 포함)
- ✅ 스터디 참여 (초대 코드)
- ✅ 일별 과제 생성

---

## Firebase 프로젝트 설정

### 1. Firebase 콘솔 접속

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택: `stock-study-15`

### 2. Firestore Database 설정

#### 데이터베이스 생성

1. Firebase 콘솔에서 **Build** > **Firestore Database** 선택
2. **Create database** 클릭
3. 위치 선택: `asia-northeast3 (Seoul)` (한국)
4. 보안 규칙 선택:
   - 개발 중: **Start in test mode** (30일 동안 읽기/쓰기 허용)
   - 프로덕션: **Start in production mode** (이후 규칙 수정 필요)

#### Firestore 보안 규칙 설정

**Rules** 탭으로 이동하여 다음 규칙 적용:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }

    // Studies collection
    match /studies/{studyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        resource.data.ownerId == request.auth.uid ||
        exists(/databases/$(database)/documents/studyMembers/$(request.auth.uid))
      );
      allow delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }

    // Study Members collection
    match /studyMembers/{memberId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Day Plans collection
    match /dayPlans/{planId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }

    // Assignments collection
    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }

    // Submissions collection (future)
    match /submissions/{submissionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Firestore 데이터 구조

### Collections (컬렉션)

프로젝트에서 사용하는 Firestore 컬렉션들:

#### 1. `users` - 사용자 정보
```javascript
{
  userId: "auto-generated-id",  // Document ID
  username: "홍길동",
  email: "hong@example.com",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 2. `studies` - 스터디 그룹
```javascript
{
  studyId: "auto-generated-id",  // Document ID
  studyName: "January Stock Study",
  description: "주식 초보자를 위한 스터디",
  bookTitle: "Stock Investment for Beginners",
  inviteCode: "ABC12345",       // 8자 랜덤 코드
  startDate: Timestamp,
  endDate: Timestamp,           // startDate + 14일
  ownerId: "user-id",
  status: "active",             // active | completed | archived
  maxMembers: 10,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 3. `studyMembers` - 스터디 멤버
```javascript
{
  memberId: "auto-generated-id", // Document ID
  studyId: "study-id",
  userId: "user-id",
  role: "owner",                 // owner | admin | member
  joinedAt: Timestamp,
  isActive: true,
  progressRate: 0                // 0-100
}
```

#### 4. `dayPlans` - 일별 학습 계획
```javascript
{
  planId: "auto-generated-id",   // Document ID
  studyId: "study-id",
  dayNumber: 1,                  // 1-15
  title: "Introduction to Stock Market",
  learningGoal: "Understand the basic concepts...",
  chapterInfo: "Chapter 1",
  description: "Day 1: Introduction..."
}
```

#### 5. `assignments` - 과제
```javascript
{
  assignmentId: "auto-generated-id", // Document ID
  planId: "day-plan-id",
  questionText: "What are the key concepts you learned today?",
  questionOrder: 1,
  isRequired: true
}
```

---

## 자동 생성되는 데이터

### 스터디 생성 시

스터디를 생성하면 다음 데이터가 자동으로 생성됩니다:

1. **Studies 문서** 1개
2. **StudyMembers 문서** 1개 (생성자를 owner로)
3. **DayPlans 문서** 15개 (Day 1 ~ Day 15)
4. **Assignments 문서** 45개 (각 Day마다 3개씩)

#### 생성되는 15일 학습 계획

| Day | 제목 | 학습 목표 |
|-----|------|-----------|
| 1 | Introduction to Stock Market | 주식 시장 기본 개념 이해 |
| 2 | Types of Stocks | 주식 종류와 특성 학습 |
| 3 | Reading Stock Charts | 주식 차트 읽기 마스터 |
| 4 | Market Analysis Fundamentals | 기본적 분석 기법 학습 |
| 5 | Financial Statements Analysis | 재무제표 이해 |
| 6 | Technical Indicators | 기술적 지표 학습 |
| 7 | Risk Management | 리스크 관리 전략 |
| 8 | Portfolio Diversification | 분산 투자 포트폴리오 |
| 9 | Market Trends and Cycles | 시장 사이클 이해 |
| 10 | Investment Strategies | 투자 전략 탐색 |
| 11 | Trading Psychology | 트레이딩 심리학 |
| 12 | Value Investing | 가치 투자 원칙 |
| 13 | Growth Investing | 성장주 식별 |
| 14 | Market News and Information | 시장 뉴스 해석 |
| 15 | Building Your Investment Plan | 투자 계획 수립 |

각 Day마다 3개의 기본 질문:
1. What are the key concepts you learned today? (필수)
2. How can you apply today's learning to your investment strategy? (필수)
3. What questions or uncertainties do you still have? (선택)

---

## 데이터 확인 방법

### Firebase 콘솔에서 확인

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택: `stock-study-15`
3. **Build** > **Firestore Database** 클릭
4. 각 컬렉션 확인:
   - `users` - 가입한 사용자 목록
   - `studies` - 생성된 스터디 목록
   - `studyMembers` - 스터디 멤버십
   - `dayPlans` - 학습 계획
   - `assignments` - 과제 목록

### 브라우저 콘솔에서 확인

1. 앱 실행 후 F12 눌러 개발자 도구 열기
2. **Console** 탭 확인
3. 스터디 생성 시 로그 확인:
   ```
   Study created successfully! { studyId: "...", inviteCode: "ABC12345" }
   ```

### 네트워크 탭에서 확인

1. 개발자 도구 > **Network** 탭
2. 필터: `firestore`
3. 스터디 생성/참여 시 요청 확인

---

## 문제 해결

### 데이터가 저장되지 않는 경우

#### 1. Firestore 보안 규칙 확인

```bash
# Firebase 콘솔 > Firestore Database > Rules 탭
# "test mode" 또는 위에 제공된 규칙 적용 확인
```

#### 2. 환경 변수 확인

```bash
# .env.local 파일 확인
cat .env.local

# 필수 변수들이 모두 설정되어 있는지 확인:
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=stock-study-15
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

#### 3. 브라우저 콘솔 에러 확인

개발자 도구 > Console 탭에서 에러 메시지 확인:

- `permission-denied` → 보안 규칙 문제
- `not-found` → 컬렉션/문서가 없음
- `network-request-failed` → 인터넷 연결 문제

#### 4. Firebase 프로젝트 상태 확인

- Firebase 프로젝트가 활성화되어 있는지 확인
- 결제 정보가 등록되어 있는지 확인 (Spark 플랜으로도 충분)

---

## 테스트 방법

### 1. 회원가입 테스트

```bash
# 브라우저에서
http://localhost:3090/register

# 입력:
- Email: test@example.com
- Username: testuser
- Password: test1234

# Firebase Console > Authentication 에서 사용자 확인
# Firestore > users 컬렉션에서 문서 확인
```

### 2. 스터디 생성 테스트

```bash
# 로그인 후
http://localhost:3090/studies/create

# 입력:
- Study Name: Test Study
- Description: For testing
- Book Title: Test Book
- Start Date: 오늘 날짜
- Max Members: 10

# 생성 후 Firestore 확인:
- studies 컬렉션: 1개 문서
- studyMembers 컬렉션: 1개 문서
- dayPlans 컬렉션: 15개 문서
- assignments 컬렉션: 45개 문서
```

### 3. 스터디 참여 테스트

```bash
# 다른 계정으로 로그인
http://localhost:3090/studies/join

# 초대 코드 입력: ABC12345 (생성 시 받은 코드)

# Firestore > studyMembers 확인:
# 새 멤버 문서가 추가되었는지 확인
```

---

## 개발 시 유용한 명령어

### Firebase Emulator (로컬 테스트)

```bash
# Firebase Emulator 설치
npm install -g firebase-tools

# 로그인
firebase login

# Emulator 초기화
firebase init emulators

# Emulator 실행
firebase emulators:start
```

### Firestore 백업

```bash
# 데이터 내보내기
gcloud firestore export gs://[BUCKET_NAME]

# 데이터 가져오기
gcloud firestore import gs://[BUCKET_NAME]/[EXPORT_NAME]
```

---

## 참고 자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firestore 데이터 모델링](https://firebase.google.com/docs/firestore/data-model)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase React 가이드](https://firebase.google.com/docs/web/setup)

---

## 요약

### ✅ 완료된 작업

1. Firestore 서비스 레이어 생성 (`src/services/studyService.ts`)
2. 스터디 생성 페이지 실제 Firebase 연동
3. 스터디 참여 페이지 실제 Firebase 연동
4. 15일 학습 계획 및 과제 자동 생성 기능

### 🚀 다음 단계

1. 대시보드에서 실제 스터디 데이터 표시
2. 스터디 목록 페이지 실제 데이터 연동
3. 일별 과제 제출 기능 구현
4. 과제 댓글 기능 구현
5. 진행률 계산 및 표시

---

**이제 Firebase에 실제 데이터가 저장됩니다!** 🎉
