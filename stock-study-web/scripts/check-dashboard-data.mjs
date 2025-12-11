#!/usr/bin/env node
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env.local') });

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

async function checkDashboardData() {
  console.log('🔍 Checking Firebase data for dashboard...\n');

  try {
    // 1. Check users collection
    const usersSnapshot = await db.collection('users').get();
    console.log(`👥 Users collection: ${usersSnapshot.size} documents`);
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.username} (${data.email})`);
    });
    console.log('');

    // 2. Check studies collection
    const studiesSnapshot = await db.collection('studies').get();
    console.log(`📚 Studies collection: ${studiesSnapshot.size} documents`);
    studiesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.studyName}`);
      console.log(`    Owner: ${data.ownerId}`);
      console.log(`    Status: ${data.status}`);
      console.log(`    Invite Code: ${data.inviteCode}`);
    });
    console.log('');

    // 3. Check studyMembers collection
    const membersSnapshot = await db.collection('studyMembers').get();
    console.log(`👤 StudyMembers collection: ${membersSnapshot.size} documents`);
    membersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}:`);
      console.log(`    userId: ${data.userId}`);
      console.log(`    studyId: ${data.studyId}`);
      console.log(`    role: ${data.role}`);
      console.log(`    isActive: ${data.isActive}`);
    });
    console.log('');

    // 4. Check specific user's data
    if (usersSnapshot.size > 0) {
      const firstUser = usersSnapshot.docs[0];
      const userId = firstUser.id;
      console.log(`🔍 Checking data for user: ${userId} (${firstUser.data().username})\n`);

      // Check their studyMembers
      const userMembersSnapshot = await db
        .collection('studyMembers')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();

      console.log(`  📊 Active studyMembers: ${userMembersSnapshot.size}`);
      for (const memberDoc of userMembersSnapshot.docs) {
        const memberData = memberDoc.data();
        console.log(`\n  Member ID: ${memberDoc.id}`);
        console.log(`    studyId: ${memberData.studyId}`);
        console.log(`    role: ${memberData.role}`);
        console.log(`    isActive: ${memberData.isActive}`);

        // Get the study details
        const studyDoc = await db.collection('studies').doc(memberData.studyId).get();
        if (studyDoc.exists()) {
          const studyData = studyDoc.data();
          console.log(`    Study: ${studyData.studyName}`);
          console.log(`    Status: ${studyData.status}`);
        } else {
          console.log(`    ⚠️ Study not found!`);
        }
      }
    }

    console.log('\n✅ Data check completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

checkDashboardData();
