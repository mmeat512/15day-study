# Firebase Setup & Schema

This document describes the Firebase configuration, Firestore schema, and security rules for the Stock Study 15-Day Tracker, mapped from the SQL schema defined in `SDD.md`.

## 1. Firestore Data Model

### 1.1. Collections Structure

```
users (collection)
  ├── {userId} (document)
  │     ├── email: string
  │     ├── username: string
  │     ├── profileImage: string (optional)
  │     ├── createdAt: timestamp
  │     └── ...
  │
studies (collection)
  ├── {studyId} (document)
  │     ├── studyName: string
  │     ├── description: string
  │     ├── bookTitle: string
  │     ├── inviteCode: string (unique)
  │     ├── startDate: timestamp
  │     ├── endDate: timestamp
  │     ├── ownerId: string (ref: users/{userId})
  │     ├── status: string ('active' | 'completed' | 'archived')
  │     ├── maxMembers: number
  │     ├── memberCount: number
  │     │
  │     ├── members (subcollection)
  │     │     ├── {userId} (document)
  │     │     │     ├── role: string ('owner' | 'admin' | 'member')
  │     │     │     ├── joinedAt: timestamp
  │     │     │     └── ...
  │     │
  │     └── dayPlans (subcollection)
  │           ├── {dayNumber} (document)  // e.g., "1", "2", ... "15"
  │           │     ├── title: string
  │           │     ├── learningGoal: string
  │           │     ├── chapterInfo: string
  │           │     ├── description: string
  │           │     ├── targetDate: timestamp
  │           │     └── assignments: array of objects
  │           │           ├── id: string
  │           │           ├── questionText: string
  │           │           ├── questionOrder: number
  │           │           └── isRequired: boolean
  │
submissions (collection)
  ├── {submissionId} (document)
        ├── studyId: string (ref: studies/{studyId})
        ├── planId: string (ref: studies/{studyId}/dayPlans/{dayNumber})
        ├── userId: string (ref: users/{userId})
        ├── dayNumber: number
        ├── content: string
        ├── fileUrl: string (optional)
        ├── visibility: string ('public' | 'private')
        ├── type: string ('assignment' | 'reflection')
        ├── submittedAt: timestamp
        │
        └── comments (subcollection)
              ├── {commentId} (document)
                    ├── userId: string
                    ├── content: string
                    ├── parentId: string (optional, for replies)
                    └── createdAt: timestamp
```

### 1.2. Key Design Decisions

1.  **Subcollections for Members**: `members` are stored as a subcollection of `studies` to easily query "all members of this study" and to support security rules checking `exists(/databases/$(database)/documents/studies/$(studyId)/members/$(request.auth.uid))`.
2.  **Subcollections for DayPlans**: `dayPlans` are scoped to a study.
3.  **Assignments as Field**: Assignments are stored as an array within the `dayPlan` document rather than a subcollection, as they are always retrieved with the plan and rarely modified individually.
4.  **Top-level Submissions**: `submissions` are a top-level collection to allow efficient querying of "all my submissions across all studies" or "all submissions for a specific day" without traversing every study.

## 2. Security Rules (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isStudyMember(studyId) {
      return exists(/databases/$(database)/documents/studies/$(studyId)/members/$(request.auth.uid));
    }

    function getStudyRole(studyId) {
      return get(/databases/$(database)/documents/studies/$(studyId)/members/$(request.auth.uid)).data.role;
    }

    function isStudyAdmin(studyId) {
      let role = getStudyRole(studyId);
      return role == 'owner' || role == 'admin';
    }

    // Users
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }

    // Studies
    match /studies/{studyId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn() && resource.data.ownerId == request.auth.uid; // Only owner can update study details

      // Members subcollection
      match /members/{memberId} {
        allow read: if isStudyMember(studyId);
        allow write: if false; // Managed via Cloud Functions or specific logic
      }

      // DayPlans subcollection
      match /dayPlans/{dayId} {
        allow read: if isStudyMember(studyId);
        allow write: if isStudyAdmin(studyId);
      }
    }

    // Submissions
    match /submissions/{submissionId} {
      allow read: if isStudyMember(resource.data.studyId) &&
                   (resource.data.visibility == 'public' || resource.data.userId == request.auth.uid || isStudyAdmin(resource.data.studyId));
      allow create: if isStudyMember(request.resource.data.studyId) && request.resource.data.userId == request.auth.uid;
      allow update: if resource.data.userId == request.auth.uid;

      // Comments
      match /comments/{commentId} {
        allow read: if isStudyMember(get(/databases/$(database)/documents/submissions/$(submissionId)).data.studyId);
        allow create: if isStudyMember(get(/databases/$(database)/documents/submissions/$(submissionId)).data.studyId);
      }
    }
  }
}
```

## 3. Indexes (firestore.indexes.json)

The following composite indexes are required for common queries:

1.  **Studies List**:

    - Collection: `studies`
    - Fields: `status` (ASC), `startDate` (DESC)

2.  **Submissions by Day**:

    - Collection: `submissions`
    - Fields: `studyId` (ASC), `dayNumber` (ASC), `submittedAt` (DESC)

3.  **My Submissions**:
    - Collection: `submissions`
    - Fields: `userId` (ASC), `submittedAt` (DESC)

## 4. Storage Rules (storage.rules)

````

## 5. Common Operations (DML & Queries)

This section provides examples of common operations using Firestore (v9 Modular SDK) alongside their SQL equivalents for reference.

### 5.1. Create (INSERT)

**Scenario: Create a new Study**

*SQL Equivalent:*
```sql
INSERT INTO studies (study_name, start_date, owner_id) VALUES ('My Study', '2025-01-01', 'user123');
-- Then insert into study_members
INSERT INTO study_members (study_id, user_id, role) VALUES (1, 'user123', 'owner');
````

_Firestore:_

```javascript
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

const createStudy = async (user, studyData) => {
  const batch = writeBatch(db);

  // 1. Create Study Document
  const studyRef = doc(collection(db, "studies"));
  batch.set(studyRef, {
    studyName: studyData.studyName,
    startDate: studyData.startDate,
    ownerId: user.uid,
    memberCount: 1,
    createdAt: serverTimestamp(),
    // ...other fields
  });

  // 2. Add Owner as Member (Subcollection)
  const memberRef = doc(
    collection(db, "studies", studyRef.id, "members"),
    user.uid
  );
  batch.set(memberRef, {
    role: "owner",
    joinedAt: serverTimestamp(),
    username: user.displayName,
  });

  await batch.commit();
};
```

### 5.2. Read (SELECT)

**Scenario: Get My Active Studies**

_SQL Equivalent:_

```sql
SELECT s.*
FROM studies s
JOIN study_members sm ON s.study_id = sm.study_id
WHERE sm.user_id = 'user123' AND s.status = 'active';
```

_Firestore:_
_Note: Since we don't have a direct join, we query the `members` subcollection group or denormalize. A common pattern in NoSQL is to store a `joinedStudyIds` array on the user or query the `members` collection group if rules allow._

_Alternative (Querying Study directly if we store `memberIds` array - limited to 10-30 items):_

```javascript
import { query, collection, where, getDocs } from "firebase/firestore";

const q = query(
  collection(db, "studies"),
  where("members", "array-contains", user.uid), // Requires 'members' array field in study doc
  where("status", "==", "active")
);
```

_Recommended Approach (Subcollection Query):_

```javascript
// Query 'members' subcollection of a specific study is easy.
// Finding ALL studies a user is in requires a Collection Group Query or denormalization.
// Here, we assume we fetch the user's 'studies' list from a user-specific collection or field.
```

**Scenario: Get Day Plans with Assignments**

_SQL Equivalent:_

```sql
SELECT * FROM day_plans d
LEFT JOIN assignments a ON d.plan_id = a.plan_id
WHERE d.study_id = 1;
```

_Firestore:_

```javascript
import { collection, getDocs } from "firebase/firestore";

const getDayPlans = async (studyId) => {
  const querySnapshot = await getDocs(
    collection(db, "studies", studyId, "dayPlans")
  );
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    // Assignments are already embedded in the document!
    return { id: doc.id, ...data };
  });
};
```

### 5.3. Update (UPDATE)

**Scenario: Update Study Status**

_SQL Equivalent:_

```sql
UPDATE studies SET status = 'completed' WHERE study_id = 1;
```

_Firestore:_

```javascript
import { doc, updateDoc } from "firebase/firestore";

const studyRef = doc(db, "studies", "studyId123");
await updateDoc(studyRef, {
  status: "completed",
});
```

### 5.4. Delete (DELETE)

**Scenario: Delete a Submission (Soft Delete)**

_SQL Equivalent:_

````sql
```javascript
import { doc, updateDoc } from "firebase/firestore";

const submissionRef = doc(db, "submissions", "sub123");
await updateDoc(submissionRef, {
  isDeleted: true, // Assuming we added this field
});
````

## 6. Schema Definition (DDL Reference)

> [!NOTE] > **Firestore is a NoSQL, schemaless database.**
> There is no command equivalent to `CREATE TABLE`. Collections and documents are created implicitly when you first write data to them.
>
> The SQL DDL below is provided **for reference only** to define the strict schema contract that our application code should enforce.

### 6.1. SQL Equivalent DDL

```sql
-- 1. Users
CREATE TABLE users (
    user_id       VARCHAR(255) PRIMARY KEY, -- Firebase UID
    email         VARCHAR(255) UNIQUE NOT NULL,
    username      VARCHAR(100) NOT NULL,
    profile_image VARCHAR(500),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Studies
CREATE TABLE studies (
    study_id      VARCHAR(255) PRIMARY KEY, -- Auto-ID
    study_name    VARCHAR(200) NOT NULL,
    description   TEXT,
    book_title    VARCHAR(300) NOT NULL,
    invite_code   VARCHAR(20) UNIQUE NOT NULL,
    start_date    DATE NOT NULL,
    end_date      DATE NOT NULL,
    owner_id      VARCHAR(255) NOT NULL REFERENCES users(user_id),
    status        VARCHAR(20) DEFAULT 'active',
    max_members   INT DEFAULT 20,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Study Members
CREATE TABLE study_members (
    study_id      VARCHAR(255) REFERENCES studies(study_id),
    user_id       VARCHAR(255) REFERENCES users(user_id),
    role          VARCHAR(20) DEFAULT 'member', -- 'owner', 'admin', 'member'
    joined_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (study_id, user_id)
);

-- 4. Day Plans
CREATE TABLE day_plans (
    plan_id       VARCHAR(255) PRIMARY KEY,
    study_id      VARCHAR(255) REFERENCES studies(study_id),
    day_number    INT NOT NULL CHECK (day_number BETWEEN 1 AND 15),
    title         VARCHAR(200) NOT NULL,
    learning_goal TEXT NOT NULL,
    chapter_info  VARCHAR(200),
    description   TEXT,
    target_date   DATE,
    -- Assignments are stored as JSONB or separate table in SQL,
    -- but embedded array in Firestore
    assignments   JSONB
);

-- 5. Submissions
CREATE TABLE submissions (
    submission_id VARCHAR(255) PRIMARY KEY,
    study_id      VARCHAR(255) REFERENCES studies(study_id),
    plan_id       VARCHAR(255) REFERENCES day_plans(plan_id),
    user_id       VARCHAR(255) REFERENCES users(user_id),
    day_number    INT NOT NULL,
    content       TEXT NOT NULL,
    file_url      VARCHAR(500),
    visibility    VARCHAR(20) DEFAULT 'public',
    type          VARCHAR(20) NOT NULL, -- 'assignment', 'reflection'
    submitted_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Comments
CREATE TABLE comments (
    comment_id    VARCHAR(255) PRIMARY KEY,
    submission_id VARCHAR(255) REFERENCES submissions(submission_id),
    user_id       VARCHAR(255) REFERENCES users(user_id),
    content       TEXT NOT NULL,
    parent_id     VARCHAR(255) REFERENCES comments(comment_id),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.2. Firestore Initialization

To "initialize" this schema in Firestore, you simply create the first document. There is no setup script required.

```javascript
// Example: Initializing the 'studies' collection by creating the first study
import { collection, addDoc } from "firebase/firestore";

const initFirstStudy = async () => {
  await addDoc(collection(db, "studies"), {
    studyName: "First Study",
    // ... fields
  });
  console.log("Studies collection initialized (implicitly)");
};
```
