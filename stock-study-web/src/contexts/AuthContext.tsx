"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User } from "../types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Map NextAuth session user to app User type
      setUser({
        uid: session.user.id,
        username: session.user.username,
        email: session.user.email,
        photoURL: session.user.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
    } else if (status === "unauthenticated") {
      setUser(null);
    }
  }, [session, status]);

  const loading = status === "loading";

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
