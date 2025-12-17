import { db } from '@/lib/db';
import { users, type NewUser, type User } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * Create a new user with hashed password
 */
export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  photoURL?: string;
}): Promise<User> {
  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Check if username already exists
  const existingUser = await db.query.users.findFirst({
    where: or(eq(users.username, data.username), eq(users.email, data.email)),
  });

  if (existingUser) {
    if (existingUser.username === data.username) {
      throw new Error('Username already taken');
    }
    if (existingUser.email === data.email) {
      throw new Error('Email already taken');
    }
  }

  // Generate unique ID using nanoid
  const { nanoid } = await import('nanoid');
  const userId = nanoid();

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      id: userId,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      photoURL: data.photoURL,
    })
    .returning();

  return newUser;
}

/**
 * Get user by ID (excludes password)
 */
export async function getUserById(id: string): Promise<Omit<User, 'password'> | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: {
      id: true,
      username: true,
      email: true,
      photoURL: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      password: false,
    },
  });

  return user || null;
}

/**
 * Get user by username or email (includes password for authentication)
 */
export async function getUserByUsernameOrEmail(
  usernameOrEmail: string
): Promise<User | null> {
  const user = await db.query.users.findFirst({
    where: or(
      eq(users.username, usernameOrEmail),
      eq(users.email, usernameOrEmail)
    ),
  });

  return user || null;
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Verify password
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
