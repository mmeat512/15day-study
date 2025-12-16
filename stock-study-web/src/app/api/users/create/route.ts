import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Vercel environment - use environment variables
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Local development - use application default credentials
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
    });
  }
}

const db = admin.firestore();

export async function POST(request: NextRequest) {
  try {
    const { uid, username, email } = await request.json();

    if (!uid || !username || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: uid, username, email' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const usersRef = db.collection('users');
    const existingUsers = await usersRef.where('username', '==', username).get();

    if (!existingUsers.empty) {
      return NextResponse.json(
        { error: 'Username already taken. Please choose another one.' },
        { status: 409 }
      );
    }

    // Create user document
    await usersRef.doc(uid).set({
      username,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user document' },
      { status: 500 }
    );
  }
}
