import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  getUserByUsernameOrEmail,
  verifyPassword,
  updateLastLogin,
} from '@/services/authService';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        usernameOrEmail: {
          label: 'Username or Email',
          type: 'text',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.usernameOrEmail || !credentials?.password) {
          return null;
        }

        // Find user by username or email
        const user = await getUserByUsernameOrEmail(
          credentials.usernameOrEmail
        );

        if (!user) {
          return null;
        }

        // Verify password
        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        // Update last login
        await updateLastLogin(user.id);

        // Return user without password
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          photoURL: user.photoURL,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.photoURL = user.photoURL;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.photoURL = token.photoURL as string | null;
      }
      return session;
    },
  },
};
