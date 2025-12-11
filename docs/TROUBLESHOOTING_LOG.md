# Troubleshooting Log & Incomplete Tasks

## 1. E2E Testing (Playwright)

**Status**: Incomplete / Failing
**Task**: `Unit/E2E Tests for Assignments`, `Unit/E2E Tests for Dashboard`

### Issue Description

Playwright E2E tests failed to execute correctly in the current environment.

### Error Log

```
ReferenceError: TransformStream is not defined
    at Object.<anonymous> (node_modules/playwright/lib/mcpBundleImpl.js:17:5390)
    ...
```

### Analysis

The error `ReferenceError: TransformStream is not defined` typically indicates an issue with the Node.js environment or version compatibility. `TransformStream` is a standard Web API available in newer Node.js versions (v18+). It is possible that the test runner or the environment is using an older version of Node.js or there is a conflict with the installed dependencies.

### Action Taken

- Configured `playwright.config.ts` to use the local dev server (`npm run dev`).
- Added `waitForLoadState('networkidle')` to ensure page load.
- Attempted to run tests multiple times.
- **Decision**: Skipped further debugging as per user request ("E2E 테스트 에러가 나면 현재 코드 그대로 유지하고 다음 페이지 구현해") to prioritize feature implementation.

### Recommendation

- Ensure Node.js version is v18 or higher.
- Try deleting `node_modules` and `package-lock.json` and reinstalling dependencies.
- Verify that no conflicting test environment configurations (like Jest's jsdom) are interfering with Playwright's runner if they share context (though they should be separate).

---

## 2. Real Firebase Integration

**Status**: Pending Configuration
**Task**: `Fetch User Data`, `Assignment Submission Logic` (Real Backend)

### Issue Description

The application is currently running in **Mock Mode**. Real Firebase authentication and database interactions are disabled.

### Reason

- The user encountered `Module not found: Can't resolve '../../lib/firebase'` and connection issues.
- User requested to temporarily comment out Auth settings to proceed with UI development (`Auth 설정 잠시 주석처리해줘`).
- Valid Firebase API keys were not yet populated in `.env.local`.

### Current State

- `src/contexts/AuthContext.tsx`: Firebase logic is commented out. A mock user is provided.
- Components use hardcoded mock data (e.g., `mockStudy`, `mockDayPlan`) instead of fetching from Firestore.

### Recommendation

1. Populate `.env.local` with valid Firebase Project keys.
2. Uncomment the Firebase import and logic in `src/contexts/AuthContext.tsx`.
3. Replace mock data in `src/app/dashboard/page.tsx`, `src/app/studies/...`, etc., with real Firestore `getDoc`/`onSnapshot` calls.

---

## 3. Firebase Authentication Setup Guide

**Status**: Required for Real Mode

To enable real authentication and database features, follow these steps:

### 1. Get Firebase API Keys

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Go to **Project Settings** > **General**.
4. Scroll down to "Your apps" and select the Web app.
5. Copy the `firebaseConfig` object values.

### 2. Configure Environment Variables

Create or update the `.env.local` file in the `stock-study-web` directory with the following keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Enable Authentication Providers

1. In Firebase Console, go to **Authentication** > **Sign-in method**.
2. Enable **Email/Password**.

### 4. Create Firestore Database

1. Go to **Firestore Database**.
2. Click **Create Database**.
3. Start in **Test mode** (for development) or **Production mode** (requires setting up security rules).
4. Ensure a collection named `users` can be created (the app will try to create user documents here).

### 5. Verify Connection

Restart the development server:

```bash
npm run dev
```

The application should now connect to your Firebase project. If you see "Module not found" errors, ensure `firebase` package is installed and `.env.local` is correctly loaded.
