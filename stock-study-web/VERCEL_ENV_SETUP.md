# Vercel 환경 변수 설정 가이드

## 문제 원인
Vercel의 serverless 환경에서는 Firestore Client SDK의 WebSocket 연결이 차단됩니다.
따라서 서버사이드 API 라우트에서 Firebase Admin SDK를 사용해야 합니다.

## 필요한 환경 변수

다음 환경 변수들을 Vercel 프로젝트에 추가해야 합니다:

1. **FIREBASE_CLIENT_EMAIL** - Firebase 서비스 계정 이메일
2. **FIREBASE_PRIVATE_KEY** - Firebase 서비스 계정 Private Key

(기존 NEXT_PUBLIC_FIREBASE_* 변수들은 그대로 유지)

## Firebase 서비스 계정 키 생성 방법

### 1. Firebase Console 접속
https://console.firebase.google.com/ 접속

### 2. 프로젝트 선택
- 현재 프로젝트 선택

### 3. 서비스 계정 키 생성
1. 좌측 메뉴에서 **⚙️ 프로젝트 설정** 클릭
2. 상단 탭에서 **서비스 계정** 클릭
3. **새 비공개 키 생성** 버튼 클릭
4. JSON 파일이 다운로드됨

### 4. JSON 파일 내용 확인
다운로드된 JSON 파일을 열면 다음과 같은 구조입니다:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

필요한 값:
- `client_email` → **FIREBASE_CLIENT_EMAIL**
- `private_key` → **FIREBASE_PRIVATE_KEY**

## Vercel에 환경 변수 추가

### 방법 1: Vercel CLI 사용
```bash
# Vercel CLI 설치 (아직 안했다면)
npm install -g vercel

# 환경 변수 추가
vercel env add FIREBASE_CLIENT_EMAIL
# 프롬프트에 client_email 값 입력
# Production, Preview, Development 모두 선택

vercel env add FIREBASE_PRIVATE_KEY
# 프롬프트에 private_key 값 입력
# ⚠️ 주의: 줄바꿈(\n)이 포함된 그대로 복사해야 함!
# Production, Preview, Development 모두 선택
```

### 방법 2: Vercel Dashboard 사용
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 메뉴
4. 다음 변수들 추가:
   - Name: `FIREBASE_CLIENT_EMAIL`
     - Value: JSON의 `client_email` 값
     - Environments: Production, Preview, Development 모두 체크
   - Name: `FIREBASE_PRIVATE_KEY`
     - Value: JSON의 `private_key` 값 전체 (-----BEGIN PRIVATE KEY----- 부터 -----END PRIVATE KEY----- 까지)
     - Environments: Production, Preview, Development 모두 체크

## 로컬 개발 환경 설정

`.env.local` 파일에 다음 추가:
```bash
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
```

⚠️ **중요**: `.env.local` 파일은 절대 git에 커밋하지 마세요! (.gitignore에 이미 추가되어 있어야 함)

## 배포 및 테스트

1. 환경 변수 추가 후 재배포:
```bash
vercel --prod
```

2. 배포 완료 후 회원가입 테스트
3. Firebase Console → Firestore Database → users 컬렉션에서 문서 생성 확인

## 변경 사항 요약

### 수정된 파일:
1. `src/app/register/page.tsx` - 서버사이드 API 호출로 변경
2. `src/app/api/users/create/route.ts` - Firebase Admin SDK 사용

### 작동 방식:
1. 클라이언트: Firebase Auth로 사용자 생성
2. 클라이언트: `/api/users/create` API 호출 (uid, username, email 전송)
3. 서버: Firebase Admin SDK로 Firestore에 문서 생성 (username 중복 체크 포함)
4. 클라이언트: Auth 프로필 업데이트 후 대시보드로 이동

이 방식은 Vercel의 serverless 환경에서도 완벽하게 작동합니다! 🎉
