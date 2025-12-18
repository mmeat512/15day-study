# Vercel 배포 가이드

## 📋 개요

이 가이드는 Stock Study 15-Day Tracker 프로젝트를 Vercel에 배포하는 방법을 단계별로 설명합니다.

## 🚀 배포 단계

### Step 1: Vercel 계정 준비

1. **Vercel 계정이 없다면:**
   - https://vercel.com 방문
   - GitHub, GitLab, 또는 이메일로 회원가입
   - 무료 Hobby 플랜 사용 가능

2. **Vercel 계정이 있다면:**
   - 로그인 준비

### Step 2: Vercel CLI 로그인

터미널에서 다음 명령어를 실행하세요:

```bash
npx vercel login
```

이메일 또는 GitHub 계정으로 로그인할 수 있습니다.

**예상 프롬프트:**

```
? Log in to Vercel
  Continue with GitHub
  Continue with GitLab
  Continue with Bitbucket
❯ Continue with Email
```

이메일을 선택하면 인증 링크가 이메일로 전송됩니다.

### Step 3: 프로젝트 링크 (선택사항)

Vercel 웹사이트에서 이미 프로젝트를 생성했다면:

```bash
npx vercel link
```

처음 배포하는 경우 이 단계를 건너뛰고 바로 배포할 수 있습니다.

### Step 4: 환경 변수 설정

Firebase 프로젝트이므로 환경 변수를 설정해야 합니다.

#### 방법 1: Vercel 웹 대시보드에서 설정

1. Vercel 대시보드에서 프로젝트 선택
2. Settings → Environment Variables
3. 다음 환경 변수들을 추가:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBZDUyAMMhE2oaJW3q_cCogHEDLBIfI-BI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stock-study-15.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=stock-study-15
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stock-study-15.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=281898542016
NEXT_PUBLIC_FIREBASE_APP_ID=1:281898542016:web:af13adf3d8956694321e25
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-HR6GR8CNZV
```

#### 방법 2: CLI로 설정

```bash
npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
# ... 나머지 환경 변수들도 추가
```

### Step 5: 첫 배포 (프리뷰)

프로젝트 루트 디렉토리에서:

```bash
npx vercel
```

**예상 프롬프트:**

```
? Set up and deploy "~/path/to/stock-study-web"? [Y/n] y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] n
? What's your project's name? stock-study-tracker
? In which directory is your code located? ./
Auto-detected Project Settings (Next.js):
- Build Command: next build
- Development Command: next dev --port $PORT
- Install Command: npm install
- Output Directory: .next
? Want to modify these settings? [y/N] n
```

이 명령어는 **프리뷰 배포**를 생성합니다 (프로덕션 아님).

### Step 6: 프로덕션 배포

프리뷰 배포가 성공하면, 프로덕션에 배포:

```bash
npx vercel --prod
```

이 명령어는:

- 프로덕션 URL에 배포
- 프로덕션 환경 변수 사용
- 최적화된 빌드 생성

### Step 7: 배포 확인

배포가 완료되면 다음과 같은 URL을 받습니다:

```
✅ Production: https://stock-study-tracker.vercel.app
```

브라우저에서 해당 URL을 열어 배포를 확인하세요.

## 🔧 추가 설정

### 도메인 설정 (선택사항)

커스텀 도메인을 사용하려면:

1. Vercel 대시보드에서 프로젝트 선택
2. Settings → Domains
3. 도메인 추가 및 DNS 설정

### 자동 배포 설정

GitHub 연동을 통한 자동 배포:

1. Vercel 대시보드에서 Settings → Git
2. GitHub 저장소 연결
3. main 브랜치에 push할 때마다 자동 배포

### Build 설정

`vercel.json` 파일을 프로젝트 루트에 생성:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

## 🎯 Vercel MCP 활용

설치한 Vercel MCP를 사용하여:

```
Claude Code에서 직접 배포 상태 확인
Vercel 프로젝트 관리
로그 조회
환경 변수 관리
```

### MCP 명령 예시

Claude Code에서 다음과 같이 요청할 수 있습니다:

```
Vercel MCP를 사용해서 현재 배포 상태를 확인해줘
최신 배포의 로그를 보여줘
프로덕션 환경의 환경 변수 목록을 보여줘
```

## 📊 배포 후 확인사항

### ✅ 체크리스트

- [ ] 랜딩페이지가 정상적으로 로드되는가?
- [ ] 회원가입/로그인이 작동하는가?
- [ ] Firebase 연결이 정상인가?
- [ ] 환경 변수가 올바르게 설정되었는가?
- [ ] 모든 페이지가 접근 가능한가?
- [ ] 모바일에서도 잘 보이는가?

### 🔍 디버깅

문제가 발생하면:

1. **Vercel 대시보드에서 로그 확인:**
   - Deployments → 최신 배포 선택 → Build Logs

2. **로컬에서 프로덕션 빌드 테스트:**

   ```bash
   npm run build
   npm run start
   ```

3. **환경 변수 확인:**
   ```bash
   npx vercel env ls
   ```

## 🚨 주의사항

### Firebase 보안 규칙

Vercel에 배포하기 전에 Firebase Security Rules를 확인하세요:

```javascript
// Firestore Rules 예시
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 접근
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 환경 변수 보안

- **절대** Firebase Admin SDK 키를 클라이언트 환경 변수에 넣지 마세요
- `NEXT_PUBLIC_` 접두사가 붙은 변수는 클라이언트에 노출됩니다
- 민감한 정보는 서버 사이드에서만 사용하세요

### 비용 관리

- **Hobby 플랜 (무료)**:
  - 월 100GB 대역폭
  - 상업용 사용 불가
  - 1개의 concurrent build

- **Pro 플랜 ($20/월)**:
  - 월 1TB 대역폭
  - 상업용 사용 가능
  - 우선 지원

## 📚 유용한 Vercel CLI 명령어

```bash
# 프로젝트 정보 확인
npx vercel inspect

# 로그 확인
npx vercel logs

# 배포 목록 보기
npx vercel ls

# 특정 배포 삭제
npx vercel rm [deployment-url]

# 프로젝트 설정 확인
npx vercel project

# 도메인 목록
npx vercel domains ls

# 환경 변수 목록
npx vercel env ls
```

## 🔗 참고 자료

### 공식 문서

- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Deploying from CLI](https://vercel.com/docs/cli/deploying-from-cli)
- [Vercel MCP Documentation](https://vercel.com/docs/mcp)

### 추가 리소스

- [Deploy MCP servers to Vercel](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
- [Use Vercel's MCP server](https://vercel.com/docs/mcp/vercel-mcp)
- [GitHub Actions with Vercel](https://www.freecodecamp.org/news/deploy-to-vercel-with-github-actions/)

## 🎉 배포 완료!

배포가 완료되면:

1. URL을 팀원들과 공유
2. 소셜 미디어에 공유
3. 피드백 수집
4. 지속적인 개선

---

**작성일:** 2025-12-10 **버전:** 1.0 **프로젝트:** Stock Study 15-Day Tracker
