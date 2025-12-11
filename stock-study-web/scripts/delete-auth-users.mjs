#!/usr/bin/env node
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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

const auth = getAuth(app);

async function deleteTestUsers() {
  console.log('🗑️  Starting Auth users cleanup...\n');

  const testEmails = [
    'testuser1@example.com',
    'testuser2@example.com',
    'test@example.com',
    'test@test.com',
    'tes1t@example.com',
  ];

  // Also delete users with test timestamp pattern
  const testPatterns = [/^test\d+@example\.com$/];

  try {
    // List all users
    const listUsersResult = await auth.listUsers();
    const usersToDelete = [];

    for (const user of listUsersResult.users) {
      const email = user.email || '';

      // Check if email matches test emails or patterns
      if (testEmails.includes(email) || testPatterns.some(pattern => pattern.test(email))) {
        usersToDelete.push(user);
      }
    }

    console.log(`Found ${usersToDelete.length} test users to delete:\n`);

    for (const user of usersToDelete) {
      try {
        await auth.deleteUser(user.uid);
        console.log(`✅ Deleted: ${user.email} (${user.displayName || 'no name'})`);
      } catch (error) {
        console.error(`❌ Failed to delete ${user.email}:`, error.message);
      }
    }

    console.log('\n✨ Auth users cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error cleaning up Auth users:', error);
    process.exit(1);
  }
}

deleteTestUsers();
