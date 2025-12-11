#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env.local') });

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

async function deleteAuthUser(localId) {
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/accounts:delete?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      localId: localId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete user ${localId}: ${error}`);
  }

  return await response.json();
}

async function deleteTestUsers() {
  console.log('🗑️  Starting Auth users cleanup using REST API...\n');

  // Read the exported users file
  const usersData = JSON.parse(readFileSync('/tmp/users.json', 'utf8'));

  const testEmails = [
    'testuser1@example.com',
    'testuser2@example.com',
    'test@example.com',
    'test@test.com',
    'tes1t@example.com',
  ];

  const testPatterns = [/^test\d+@example\.com$/];

  const usersToDelete = usersData.users.filter(user => {
    const email = user.email || '';
    return testEmails.includes(email) || testPatterns.some(pattern => pattern.test(email));
  });

  console.log(`Found ${usersToDelete.length} test users to delete:\n`);

  for (const user of usersToDelete) {
    try {
      await deleteAuthUser(user.localId);
      console.log(`✅ Deleted: ${user.email} (${user.displayName || 'no name'})`);
    } catch (error) {
      console.error(`❌ Failed to delete ${user.email}:`, error.message);
    }
  }

  console.log('\n✨ Auth users cleanup completed!');
  process.exit(0);
}

deleteTestUsers().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
