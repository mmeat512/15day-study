import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function verifyUsers() {
  console.log('🔍 Checking Firestore users collection...\n');
  console.log(`📍 Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}\n`);

  try {
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();

    console.log(`📊 Total users in Firestore: ${usersSnapshot.size}\n`);

    if (usersSnapshot.empty) {
      console.log('❌ No users found in Firestore!');
      console.log('This confirms that setDoc() is not successfully creating documents.\n');
      return;
    }

    // List all users
    console.log('👥 Users in Firestore:\n');
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - UID: ${doc.id}`);
      console.log(`    Email: ${data.email || 'N/A'}`);
      console.log(`    Username: ${data.username || 'N/A'}`);
      console.log(`    Created: ${data.createdAt?.toDate() || 'N/A'}`);
      console.log('');
    });

    // Check for test users specifically
    const testUserEmails = [
      'wndus0958@naver.com',
      'wndus0958+test3@naver.com',
      'wndus0958+test4@naver.com'
    ];

    console.log('\n🔎 Checking for specific test accounts...\n');
    for (const email of testUserEmails) {
      const userQuery = await db.collection('users')
        .where('email', '==', email)
        .get();

      if (userQuery.empty) {
        console.log(`  ❌ ${email} - NOT FOUND in Firestore`);
      } else {
        console.log(`  ✅ ${email} - FOUND in Firestore`);
        userQuery.forEach(doc => {
          console.log(`     UID: ${doc.id}, Username: ${doc.data().username}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error checking Firestore:', error);
  }
}

verifyUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
