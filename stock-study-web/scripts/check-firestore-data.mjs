#!/usr/bin/env node
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env.local') });

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkFirestoreData() {
  console.log('🔍 Checking Firestore collections...\n');

  try {
    // Check users collection
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`👥 Users collection: ${usersSnapshot.size} documents`);
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.username} (${data.email})`);
    });
    console.log('');

    // Check studies collection
    const studiesSnapshot = await getDocs(collection(db, 'studies'));
    console.log(`📚 Studies collection: ${studiesSnapshot.size} documents`);
    studiesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.studyName}`);
      console.log(`    Owner: ${data.ownerId}`);
      console.log(`    Status: ${data.status}`);
      console.log(`    Invite Code: ${data.inviteCode}`);
    });
    console.log('');

    // Check studyMembers collection
    const membersSnapshot = await getDocs(collection(db, 'studyMembers'));
    console.log(`👤 StudyMembers collection: ${membersSnapshot.size} documents`);
    if (membersSnapshot.size === 0) {
      console.log('  ⚠️ No studyMembers found! This is why the dashboard is empty.');
    }
    membersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}:`);
      console.log(`    userId: ${data.userId}`);
      console.log(`    studyId: ${data.studyId}`);
      console.log(`    role: ${data.role}`);
      console.log(`    isActive: ${data.isActive}`);
    });
    console.log('');

    // Check submissions collection
    const submissionsSnapshot = await getDocs(collection(db, 'submissions'));
    console.log(`📝 Submissions collection: ${submissionsSnapshot.size} documents`);
    console.log('');

    // Check comments collection
    const commentsSnapshot = await getDocs(collection(db, 'comments'));
    console.log(`💬 Comments collection: ${commentsSnapshot.size} documents`);
    console.log('');

    console.log('✅ Firestore data check completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkFirestoreData();
