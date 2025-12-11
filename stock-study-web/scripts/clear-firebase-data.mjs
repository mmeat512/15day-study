#!/usr/bin/env node
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env.local') });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteCollection(collectionName) {
  console.log(`📦 Deleting collection: ${collectionName}`);

  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = [];

    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
    });

    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${deletePromises.length} documents from ${collectionName}\n`);
  } catch (error) {
    console.error(`❌ Error deleting ${collectionName}:`, error.message);
  }
}

async function clearAllData() {
  console.log('🗑️  Starting Firebase data cleanup...\n');
  console.log('⚠️  Note: Firebase Auth users cannot be deleted from client SDK.');
  console.log('    Please manually delete users from Firebase Console if needed.\n');

  try {
    // Delete collections in order (to avoid foreign key issues)
    await deleteCollection('comments');
    await deleteCollection('submissions');
    await deleteCollection('studies');
    await deleteCollection('users');

    console.log('\n✨ All Firestore data has been cleared successfully!');
    console.log('\n📝 To delete Auth users:');
    console.log('   1. Go to Firebase Console');
    console.log('   2. Navigate to Authentication > Users');
    console.log('   3. Delete users manually\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error clearing Firebase data:', error);
    process.exit(1);
  }
}

clearAllData();
