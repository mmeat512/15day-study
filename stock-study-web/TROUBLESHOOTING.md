# 🔧 문제 해결 가이드

## Firebase 데이터 저장 문제 해결 완료 ✅

### 발견된 문제

Firebase에 계정(Authentication)만 연동되어 있고, 실제 스터디 데이터가 Firestore에 저장되지 않았습니다.

### 원인

스터디 생성, 참여 등의 기능이 Mock 데이터를 사용하고 있었으며, 실제 Firestore에 데이터를 저장하는 로직이 구현되어 있지 않았습니다.

### 해결 방법

다음 작업을 완료했습니다:

#### 1. Firestore 서비스 레이어 생성

새 파일: `src/services/studyService.ts`

제공 기능:
- ✅ `createStudy()` - 스터디 생성 및 15일 학습 계획 자동 생성
- ✅ `joinStudy()` - 초대 코드로 스터디 참여
- ✅ `getUserStudies()` - 사용자의 스터디 목록 조회
- ✅ `getStudy()` - 스터디 상세 정보 조회
- ✅ `getDayPlans()` - 학습 계획 조회
- ✅ `getAssignments()` - 과제 조회

#### 2. 페이지 업데이트

**스터디 생성 페이지** (`src/app/studies/create/page.tsx`)
- Mock API 호출 제거
- 실제 `createStudy()` 함수 연동
- 에러 처리 및 사용자 피드백 추가
- Description 필드 추가

**스터디 참여 페이지** (`src/app/studies/join/page.tsx`)
- Mock API 호출 제거
- 실제 `joinStudy()` 함수 연동
- 초대 코드 검증 및 에러 처리

#### 3. 자동 생성 기능

스터디 생성 시 자동으로 생성되는 데이터:

1. **Studies 문서** 1개
   - 스터디 기본 정보
   - 랜덤 초대 코드 (8자리)
   - 시작일/종료일 (15일)

2. **StudyMembers 문서** 1개
   - 생성자를 owner로 등록

3. **DayPlans 문서** 15개
   - Day 1: Introduction to Stock Market
   - Day 2: Types of Stocks
   - ... (15일까지)

4. **Assignments 문서** 45개
   - 각 Day마다 3개씩
   - 필수 질문 2개 + 선택 질문 1개

---

## 확인 방법

### 1. Firebase 콘솔에서 확인

```
1. https://console.firebase.google.com/ 접속
2. stock-study-15 프로젝트 선택
3. Firestore Database 클릭
4. 다음 컬렉션 확인:
   - users
   - studies
   - studyMembers
   - dayPlans
   - assignments
```

### 2. 테스트 시나리오

#### 스터디 생성 테스트

```bash
# 1. 로그인
http://localhost:3090/login

# 2. 스터디 생성 페이지
http://localhost:3090/studies/create

# 3. 정보 입력
Study Name: Test Study
Description: For testing
Book Title: Test Book
Start Date: 2025-01-15
Max Members: 10

# 4. Create Study 버튼 클릭

# 5. 알림창 확인
"Study created successfully!
Invite Code: XXXXXXXX"

# 6. Firebase 콘솔 확인
studies: 1개 문서
studyMembers: 1개 문서
dayPlans: 15개 문서
assignments: 45개 문서
```

#### 스터디 참여 테스트

```bash
# 1. 다른 계정으로 로그인

# 2. 스터디 참여 페이지
http://localhost:3090/studies/join

# 3. 초대 코드 입력
Invite Code: XXXXXXXX (생성 시 받은 코드)

# 4. Join Study 버튼 클릭

# 5. Firebase 콘솔 확인
studyMembers: 2개 문서 (owner + new member)
```

### 3. 브라우저 콘솔 로그

성공 시 콘솔에 표시되는 메시지:

```javascript
// 스터디 생성
Study created successfully! { studyId: "...", inviteCode: "ABC12345" }

// 스터디 참여
Joined study successfully! { studyId: "..." }
```

---

## 추가 문제 해결

### "Permission denied" 에러

**증상**: Firestore 작업 시 permission denied 에러 발생

**해결**:
1. Firebase Console > Firestore Database > Rules 탭
2. 다음 규칙 적용:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

또는 `FIREBASE_SETUP.md` 파일의 상세 보안 규칙 참조

### "Collection not found" 에러

**증상**: 컬렉션을 찾을 수 없다는 에러

**해결**:
1. Firestore Database가 생성되어 있는지 확인
2. Test mode 또는 Production mode로 초기화
3. 첫 스터디를 생성하여 컬렉션 자동 생성

### 환경 변수 문제

**증상**: Firebase 연결 실패

**해결**:
```bash
# .env.local 파일 확인
cat .env.local

# 필수 변수 확인
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=stock-study-15
...

# 앱 재시작
npm run pm2:restart
```

### 로그인 후에도 데이터가 안 보이는 경우

**증상**: 로그인은 되지만 스터디 목록이 빈 상태

**원인**: 아직 스터디를 생성하거나 참여하지 않음

**해결**:
1. 새 스터디 생성하거나
2. 다른 사람의 초대 코드로 참여

---

## 개발 팁

### Firestore 데이터 초기화

```javascript
// 테스트 데이터 삭제 (조심!)
// Firebase Console > Firestore Database
// 각 문서를 선택하여 삭제
```

### 로컬 개발 시 유의사항

1. **네트워크 연결 필수**
   - Firestore는 클라우드 서비스이므로 인터넷 필요

2. **캐시 확인**
   - Persistent cache가 활성화되어 있어 오프라인에서도 일부 작동
   - 하드 리프레시: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

3. **보안 규칙 테스트**
   - Firebase Console > Firestore Database > Rules 탭
   - "Rules Playground"에서 규칙 시뮬레이션 가능

---

## 다음 구현 예정 기능

현재 Mock 데이터를 사용하는 기능들:

1. **대시보드** - 실제 스터디 데이터 표시 필요
2. **스터디 목록** - getUserStudies() 연동 필요
3. **일별 과제 페이지** - getDayPlans(), getAssignments() 연동 필요
4. **과제 제출** - 제출 기능 구현 필요
5. **마이페이지** - 실제 통계 계산 필요

---

## 참고 문서

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Firebase 설정 상세 가이드
- **[README.md](./README.md)** - 프로젝트 전체 문서
- **[USER_GUIDE.md](./USER_GUIDE.md)** - 사용자 가이드

---

## 요약

### ✅ 해결 완료

- Firebase Authentication: 완료
- Firestore 데이터 저장: **완료** ✨
  - 사용자 정보 저장
  - 스터디 생성 및 저장
  - 15일 학습 계획 자동 생성
  - 과제 자동 생성
  - 스터디 참여 기능

### 🚀 향후 작업

- 대시보드 실제 데이터 연동
- 스터디 목록 실제 데이터 연동
- 과제 제출 기능 구현
- 댓글 기능 구현
- 진행률 계산 로직

---

**문제가 해결되지 않으면 다음을 확인하세요:**

1. Firebase 콘솔에서 Firestore Database가 생성되어 있는지
2. 보안 규칙이 올바르게 설정되어 있는지
3. 환경 변수가 정확한지
4. 브라우저 콘솔의 에러 메시지
5. PM2 로그: `npm run pm2:logs`

모든 것을 확인했는데도 작동하지 않으면 앱을 재시작하세요:
```bash
npm run pm2:restart
```
