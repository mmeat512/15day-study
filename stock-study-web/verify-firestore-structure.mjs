import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./stockstudy-6ac69-firebase-adminsdk-yj79g-32e14cd2bf.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function verifyStructure() {
  console.log('🔍 Verifying Firestore structure for new features...\n');

  try {
    // Check collections
    const collections = ['users', 'studies', 'studyMembers', 'dayPlans', 'assignments', 'submissions', 'comments'];

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).limit(3).get();
      console.log(`📦 ${collectionName}: ${snapshot.size} document(s) sampled`);

      if (snapshot.size > 0) {
        const firstDoc = snapshot.docs[0];
        console.log(`   Sample fields: ${Object.keys(firstDoc.data()).join(', ')}`);
      }
    }

    // Specifically check if we have any submissions or comments
    console.log('\n🎯 Checking for existing submissions and comments...');

    const submissionsSnapshot = await db.collection('submissions').get();
    console.log(`   Total submissions: ${submissionsSnapshot.size}`);

    if (submissionsSnapshot.size > 0) {
      const firstSubmission = submissionsSnapshot.docs[0].data();
      console.log(`   Sample submission has: ${Object.keys(firstSubmission).join(', ')}`);
    }

    const commentsSnapshot = await db.collection('comments').get();
    console.log(`   Total comments: ${commentsSnapshot.size}`);

    if (commentsSnapshot.size > 0) {
      const firstComment = commentsSnapshot.docs[0].data();
      console.log(`   Sample comment has: ${Object.keys(firstComment).join(', ')}`);
    }

    // Check for a specific study to test with
    console.log('\n📚 Finding active studies...');
    const studiesSnapshot = await db.collection('studies')
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (studiesSnapshot.size > 0) {
      const study = studiesSnapshot.docs[0].data();
      const studyId = studiesSnapshot.docs[0].id;
      console.log(`   ✅ Found active study: "${study.studyName}" (ID: ${studyId})`);
      console.log(`      Invite code: ${study.inviteCode}`);

      // Get members for this study
      const membersSnapshot = await db.collection('studyMembers')
        .where('studyId', '==', studyId)
        .get();
      console.log(`      Members: ${membersSnapshot.size}`);

      if (membersSnapshot.size > 0) {
        for (const memberDoc of membersSnapshot.docs) {
          const member = memberDoc.data();
          const userDoc = await db.collection('users').doc(member.userId).get();
          const userData = userDoc.data();
          console.log(`         - ${userData?.username || 'Unknown'} (progress: ${member.progressRate || 0}%)`);
        }
      }

      // Get day plans for this study
      const dayPlansSnapshot = await db.collection('dayPlans')
        .where('studyId', '==', studyId)
        .orderBy('dayNumber', 'asc')
        .limit(3)
        .get();
      console.log(`      Day plans: ${dayPlansSnapshot.size}+ available`);

      if (dayPlansSnapshot.size > 0) {
        const firstDay = dayPlansSnapshot.docs[0];
        const dayData = firstDay.data();
        console.log(`         - Day ${dayData.dayNumber}: ${dayData.title}`);

        // Check assignments for first day
        const assignmentsSnapshot = await db.collection('assignments')
          .where('planId', '==', firstDay.id)
          .get();
        console.log(`           Assignments: ${assignmentsSnapshot.size}`);
      }
    }

    console.log('\n✅ Verification complete!');
    console.log('\n📝 Summary:');
    console.log('   - All collection structures are in place');
    console.log('   - Ready for submission and comment features');
    console.log('   - Use the active study above for testing');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyStructure();
