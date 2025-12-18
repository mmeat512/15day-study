/**
 * Firebase to Neon PostgreSQL Migration Script
 *
 * This script migrates all data from Firebase Firestore to Neon PostgreSQL.
 *
 * Migration order (respects foreign key constraints):
 * 1. Users (no dependencies)
 * 2. Studies (depends on users - ownerId)
 * 3. StudyMembers (depends on studies and users)
 * 4. DayPlans (depends on studies)
 * 5. Assignments (depends on dayPlans)
 * 6. Submissions (depends on dayPlans, studies, users)
 * 7. Comments (depends on submissions, studies, users)
 *
 * Usage: npx tsx scripts/migrate-firebase-to-neon.ts
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { db } from "../src/lib/db";
import {
  users,
  studies,
  studyMembers,
  dayPlans,
  assignments,
  submissions,
  comments,
} from "../src/db/schema";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

initializeApp({
  credential: cert(serviceAccount as any),
});

const firestore = getFirestore();

// Temporary password for all migrated users
const TEMP_PASSWORD = "ChangeMe123!";

/**
 * Helper function to convert Firebase Timestamp to Date
 */
function toDate(timestamp: any): Date {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000);
  }
  return new Date(timestamp);
}

/**
 * Migrate Users collection
 */
async function migrateUsers() {
  console.log("\n📦 Migrating Users...");

  const usersSnapshot = await firestore.collection("users").get();
  console.log(`Found ${usersSnapshot.size} users to migrate`);

  const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);
  let migratedCount = 0;
  let skippedCount = 0;

  for (const doc of usersSnapshot.docs) {
    const data = doc.data();

    try {
      await db
        .insert(users)
        .values({
          id: doc.id, // Preserve Firebase UID
          username: data.username,
          email: data.email,
          password: hashedPassword, // Set temporary password
          photoURL: data.photoURL || null,
          createdAt: toDate(data.createdAt),
          updatedAt: new Date(),
          lastLoginAt: data.lastLoginAt ? toDate(data.lastLoginAt) : null,
        })
        .onConflictDoNothing();

      migratedCount++;
      console.log(`✓ Migrated user: ${data.username} (${doc.id})`);
    } catch (error: any) {
      console.error(`✗ Failed to migrate user ${doc.id}:`, error.message);
      skippedCount++;
    }
  }

  console.log(`✅ Users: ${migratedCount} migrated, ${skippedCount} skipped`);
}

/**
 * Migrate Studies collection
 */
async function migrateStudies() {
  console.log("\n📦 Migrating Studies...");

  const studiesSnapshot = await firestore.collection("studies").get();
  console.log(`Found ${studiesSnapshot.size} studies to migrate`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const doc of studiesSnapshot.docs) {
    const data = doc.data();

    try {
      await db
        .insert(studies)
        .values({
          id: doc.id,
          studyName: data.studyName,
          description: data.description || "",
          bookTitle: data.bookTitle,
          inviteCode: data.inviteCode,
          startDate: toDate(data.startDate),
          endDate: toDate(data.endDate),
          ownerId: data.ownerId,
          status: data.status || "active",
          maxMembers: data.maxMembers || 10,
          createdAt: toDate(data.createdAt),
          updatedAt: new Date(),
        })
        .onConflictDoNothing();

      migratedCount++;
      console.log(`✓ Migrated study: ${data.studyName} (${doc.id})`);
    } catch (error: any) {
      console.error(`✗ Failed to migrate study ${doc.id}:`, error.message);
      skippedCount++;
    }
  }

  console.log(`✅ Studies: ${migratedCount} migrated, ${skippedCount} skipped`);
}

/**
 * Migrate StudyMembers collection
 */
async function migrateStudyMembers() {
  console.log("\n📦 Migrating Study Members...");

  const membersSnapshot = await firestore.collection("studyMembers").get();
  console.log(`Found ${membersSnapshot.size} study members to migrate`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const doc of membersSnapshot.docs) {
    const data = doc.data();

    try {
      await db
        .insert(studyMembers)
        .values({
          id: doc.id,
          studyId: data.studyId,
          userId: data.userId,
          role: data.role || "member",
          joinedAt: toDate(data.joinedAt),
          isActive: data.isActive !== false, // Default to true if not set
          progressRate: data.progressRate || 0,
        })
        .onConflictDoNothing();

      migratedCount++;
      console.log(`✓ Migrated member: ${data.userId} in study ${data.studyId}`);
    } catch (error: any) {
      console.error(`✗ Failed to migrate member ${doc.id}:`, error.message);
      skippedCount++;
    }
  }

  console.log(`✅ Study Members: ${migratedCount} migrated, ${skippedCount} skipped`);
}

/**
 * Migrate DayPlans collection
 */
async function migrateDayPlans() {
  console.log("\n📦 Migrating Day Plans...");

  const dayPlansSnapshot = await firestore.collection("dayPlans").get();
  console.log(`Found ${dayPlansSnapshot.size} day plans to migrate`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const doc of dayPlansSnapshot.docs) {
    const data = doc.data();

    try {
      await db
        .insert(dayPlans)
        .values({
          id: doc.id,
          studyId: data.studyId,
          dayNumber: data.dayNumber,
          title: data.title,
          learningGoal: data.learningGoal || "",
          chapterInfo: data.chapterInfo || "",
          description: data.description || "",
          targetDate: toDate(data.targetDate),
        })
        .onConflictDoNothing();

      migratedCount++;
      console.log(`✓ Migrated day plan: Day ${data.dayNumber} (${doc.id})`);
    } catch (error: any) {
      console.error(`✗ Failed to migrate day plan ${doc.id}:`, error.message);
      skippedCount++;
    }
  }

  console.log(`✅ Day Plans: ${migratedCount} migrated, ${skippedCount} skipped`);
}

/**
 * Migrate Assignments collection
 */
async function migrateAssignments() {
  console.log("\n📦 Migrating Assignments...");

  const assignmentsSnapshot = await firestore.collection("assignments").get();
  console.log(`Found ${assignmentsSnapshot.size} assignments to migrate`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const doc of assignmentsSnapshot.docs) {
    const data = doc.data();

    try {
      await db
        .insert(assignments)
        .values({
          id: doc.id,
          planId: data.planId,
          questionText: data.questionText,
          questionOrder: data.questionOrder || 1,
          isRequired: data.isRequired !== false, // Default to true
        })
        .onConflictDoNothing();

      migratedCount++;
      console.log(`✓ Migrated assignment: ${data.questionText.substring(0, 50)}... (${doc.id})`);
    } catch (error: any) {
      console.error(`✗ Failed to migrate assignment ${doc.id}:`, error.message);
      skippedCount++;
    }
  }

  console.log(`✅ Assignments: ${migratedCount} migrated, ${skippedCount} skipped`);
}

/**
 * Migrate Submissions collection
 */
async function migrateSubmissions() {
  console.log("\n📦 Migrating Submissions...");

  const submissionsSnapshot = await firestore.collection("submissions").get();
  console.log(`Found ${submissionsSnapshot.size} submissions to migrate`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const doc of submissionsSnapshot.docs) {
    const data = doc.data();

    try {
      // Convert answers array to match PostgreSQL JSONB structure
      const answersArray = Array.isArray(data.answers)
        ? data.answers.map((answer: any) => ({
            assignmentId: answer.assignmentId,
            answer: answer.answerText || answer.answer || "",
          }))
        : [];

      await db
        .insert(submissions)
        .values({
          id: doc.id,
          planId: data.planId,
          studyId: data.studyId,
          userId: data.userId,
          dayNumber: data.dayNumber,
          answers: answersArray as any, // PostgreSQL will handle JSONB conversion
          reflection: data.reflection || null,
          isCompleted: data.isCompleted !== false,
          submittedAt: toDate(data.submittedAt),
          createdAt: toDate(data.createdAt),
          updatedAt: new Date(),
        })
        .onConflictDoNothing();

      migratedCount++;
      console.log(`✓ Migrated submission: Day ${data.dayNumber} by ${data.userId} (${doc.id})`);
    } catch (error: any) {
      console.error(`✗ Failed to migrate submission ${doc.id}:`, error.message);
      skippedCount++;
    }
  }

  console.log(`✅ Submissions: ${migratedCount} migrated, ${skippedCount} skipped`);
}

/**
 * Migrate Comments collection
 */
async function migrateComments() {
  console.log("\n📦 Migrating Comments...");

  const commentsSnapshot = await firestore.collection("comments").get();
  console.log(`Found ${commentsSnapshot.size} comments to migrate`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const doc of commentsSnapshot.docs) {
    const data = doc.data();

    try {
      await db
        .insert(comments)
        .values({
          id: doc.id,
          submissionId: data.submissionId,
          studyId: data.studyId,
          userId: data.userId,
          content: data.content,
          isDeleted: data.isDeleted === true,
          createdAt: toDate(data.createdAt),
          updatedAt: data.updatedAt ? toDate(data.updatedAt) : new Date(),
        })
        .onConflictDoNothing();

      migratedCount++;
      console.log(`✓ Migrated comment: ${data.content.substring(0, 50)}... (${doc.id})`);
    } catch (error: any) {
      console.error(`✗ Failed to migrate comment ${doc.id}:`, error.message);
      skippedCount++;
    }
  }

  console.log(`✅ Comments: ${migratedCount} migrated, ${skippedCount} skipped`);
}

/**
 * Main migration function
 */
async function main() {
  console.log("🚀 Starting Firebase to Neon PostgreSQL Migration...\n");
  console.log("⚠️  Important: All users will have temporary password:", TEMP_PASSWORD);
  console.log("⚠️  Users will need to reset their passwords after migration.\n");

  try {
    // Migrate in order (respecting foreign key constraints)
    await migrateUsers();
    await migrateStudies();
    await migrateStudyMembers();
    await migrateDayPlans();
    await migrateAssignments();
    await migrateSubmissions();
    await migrateComments();

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Notify all users to reset their passwords");
    console.log("2. Test all functionality locally");
    console.log("3. Deploy to Vercel");
    console.log("4. Remove Firebase dependencies after verification");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run migration
main();
