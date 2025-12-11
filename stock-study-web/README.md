# Stock Study 15-Day Tracker

주식 스터디를 15일 동안 체계적으로 관리하고 추적할 수 있는 웹 애플리케이션입니다.

## 프로젝트 소개

Stock Study 15-Day Tracker는 주식 공부를 위한 스터디 그룹을 관리하고, 일일 과제와 학습 진행 상황을 추적할 수 있는 플랫폼입니다. 사용자들은 스터디를 생성하거나 참여하고, 매일의 학습 목표를 달성하며 서로의 성장을 공유할 수 있습니다.

## 주요 기능

### 사용자 관리
- 이메일 또는 사용자명으로 회원가입 및 로그인
- 사용자명 중복 확인 및 고유성 검증
- Firebase Authentication 기반 인증 시스템
- 인증된 사용자만 접근 가능한 보호된 라우트

### 스터디 관리
- 새로운 스터디 생성 (스터디명, 책 제목, 기간 설정)
- 초대 코드를 통한 스터디 참여
- 스터디 진행 상황 추적
- 멤버 역할 관리 (owner, admin, member)

### 일일 과제 시스템
- 15일 동안의 학습 계획 수립
- 일별 학습 목표 및 챕터 정보 관리
- 과제 제출 및 진행률 추적
- 오늘의 과제 대시보드 표시

### 대시보드
- 현재 참여 중인 스터디 개요
- 학습 진행률 시각화
- 오늘의 과제 빠른 접근
- 개인 통계 (제출 횟수, 코멘트 수)

### 마이페이지
- 사용자 프로필 정보
- 참여 중인 스터디 목록
- 학습 통계 및 성과

## 기술 스택

### Frontend
- **Next.js 16.0.7** - React 기반 풀스택 프레임워크
- **React 19.2.0** - UI 라이브러리
- **TypeScript 5** - 타입 안정성을 위한 정적 타입 언어
- **Tailwind CSS 4** - 유틸리티 우선 CSS 프레임워크

### Backend & Database
- **Firebase 12.6.0**
  - Firebase Authentication - 사용자 인증
  - Firestore - NoSQL 데이터베이스 (persistent local cache 활성화)

### UI Components
- **Radix UI** - 접근성 높은 UI 컴포넌트
- **Lucide React** - 아이콘 라이브러리
- **class-variance-authority** - 조건부 스타일링

### Development Tools
- **ESLint** - 코드 품질 관리
- **Jest** - 단위 테스트
- **Playwright** - E2E 테스트
- **Testing Library** - React 컴포넌트 테스트

## 시작하기

### 필수 요구사항
- Node.js 20 이상
- npm, yarn, 또는 pnpm 패키지 매니저

### 환경 설정

1. 저장소 클론
```bash
git clone <repository-url>
cd stock-study-web
```

2. 의존성 설치
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 Firebase 설정을 추가합니다:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 개발 서버 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

브라우저에서 [http://localhost:3090](http://localhost:3090)을 열어 애플리케이션을 확인할 수 있습니다.

### 빌드 및 프로덕션

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

### 테스트

```bash
# 단위 테스트 실행
npm run test

# 테스트 감시 모드
npm run test:watch

# E2E 테스트 (Playwright)
npx playwright test
```

### 백그라운드 실행 (PM2)

애플리케이션을 백그라운드에서 실행하고 자동으로 로그를 수집할 수 있습니다.

#### 백그라운드 시작

```bash
npm run pm2:start
```

#### PM2 관리 명령어

```bash
# 애플리케이션 중지
npm run pm2:stop

# 애플리케이션 재시작
npm run pm2:restart

# 애플리케이션 삭제
npm run pm2:delete

# 실시간 로그 보기
npm run pm2:logs

# 로그 삭제
npm run pm2:logs:clear

# 프로세스 모니터링
npm run pm2:monitor

# 프로세스 상태 확인
npm run pm2:status
```

#### 로그 파일 위치

로그는 `logs/` 디렉토리에 자동으로 저장됩니다:

- `logs/out.log` - 표준 출력 로그
- `logs/error.log` - 에러 로그
- `logs/combined.log` - 통합 로그 (JSON 형식)

로그는 JSON 형식으로 저장되며, 타임스탬프와 프로세스 정보를 포함합니다.

#### PM2 설정

`ecosystem.config.js` 파일에서 PM2 설정을 관리할 수 있습니다:
- 자동 재시작 활성화
- 메모리 제한 (1GB)
- 로그 날짜 형식 설정
- 환경 변수 설정

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── dashboard/         # 대시보드 페이지
│   ├── login/             # 로그인 페이지
│   ├── register/          # 회원가입 페이지
│   ├── mypage/            # 마이페이지
│   └── studies/           # 스터디 관련 페이지
│       ├── create/        # 스터디 생성
│       ├── join/          # 스터디 참여
│       └── [studyId]/     # 스터디 상세
│           └── day/[dayNumber]/  # 일별 과제
├── components/            # React 컴포넌트
│   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   ├── dashboard/        # 대시보드 컴포넌트
│   ├── mypage/          # 마이페이지 컴포넌트
│   ├── study/           # 스터디 관련 컴포넌트
│   └── ProtectedRoute.tsx # 인증 보호 라우트
├── contexts/             # React Context
│   └── AuthContext.tsx  # 인증 컨텍스트
├── lib/                 # 유틸리티 및 설정
│   ├── firebase.ts      # Firebase 초기화
│   └── utils.ts         # 유틸리티 함수
└── types/               # TypeScript 타입 정의
    ├── study.ts         # 스터디 관련 타입
    └── user.ts          # 사용자 관련 타입
```

## 주요 데이터 모델

### Study (스터디)
- 스터디 기본 정보 (이름, 설명, 책 제목)
- 초대 코드 및 멤버 제한
- 시작일/종료일 및 상태 관리

### StudyMember (스터디 멤버)
- 사용자-스터디 관계
- 역할 및 권한 관리
- 진행률 추적

### DayPlan (일일 계획)
- 15일 학습 계획
- 학습 목표 및 챕터 정보
- 과제 관리

### Assignment (과제)
- 일별 과제 문항
- 필수/선택 여부
- 순서 관리

## 사용자 가이드

프로젝트를 처음 사용하시나요? 다음 가이드를 참고하세요:

### 📖 문서

- **[빠른 시작 가이드 (QUICKSTART.md)](./QUICKSTART.md)** - 5분 안에 시작하기
- **[상세 사용자 가이드 (USER_GUIDE.md)](./USER_GUIDE.md)** - 초등학생도 이해할 수 있는 친절한 설명
- **[애플리케이션 플로우 (APP_FLOW.md)](./APP_FLOW.md)** - 앱의 동작 방식과 흐름 이해하기
- **[Firebase 설정 가이드 (FIREBASE_SETUP.md)](./FIREBASE_SETUP.md)** - Firestore 데이터베이스 설정 및 문제 해결
- **[PM2 백그라운드 실행 가이드 (PM2_GUIDE.md)](./PM2_GUIDE.md)** - 백그라운드 실행 및 로그 관리

### 🎯 주요 페이지

프로젝트를 시작한 후 다음 페이지들에 접속할 수 있습니다:

| 페이지 | URL | 설명 |
|--------|-----|------|
| 로그인 | `http://localhost:3090/login` | 계정으로 로그인 |
| 회원가입 | `http://localhost:3090/register` | 새 계정 만들기 |
| 대시보드 | `http://localhost:3090/dashboard` | 학습 현황 확인 |
| 스터디 생성 | `http://localhost:3090/studies/create` | 새 스터디 그룹 만들기 |
| 스터디 참여 | `http://localhost:3090/studies/join` | 초대 코드로 참여 |
| 마이페이지 | `http://localhost:3090/mypage` | 내 정보 및 통계 |

## 최근 업데이트

- Firestore persistent local cache 적용으로 오프라인 지원 개선
- 이메일 또는 사용자명으로 로그인 가능
- 사용자명 기반 회원가입 시 중복 체크 기능 추가
- AuthContext를 통한 전역 인증 상태 관리
- 개발 서버 포트 3000에서 3090으로 변경
- PM2를 통한 백그라운드 실행 및 로그 관리 기능 추가
- 초보자를 위한 상세 사용자 가이드 문서 추가

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 기여

프로젝트에 기여하고 싶으시다면 이슈를 생성하거나 풀 리퀘스트를 제출해 주세요.
