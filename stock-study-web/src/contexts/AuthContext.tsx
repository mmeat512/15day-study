"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { User } from "../types/user";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("AuthContext: useEffect started");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AuthContext: onAuthStateChanged triggered", firebaseUser);
      try {
        if (firebaseUser) {
          console.log("AuthContext: User found, fetching Firestore data...");
          // Fetch additional user data from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          console.log("AuthContext: Firestore doc fetched", userDoc.exists());
          console.log("🔍 Firestore doc path:", `users/${firebaseUser.uid}`);
          console.log("🔍 Firebase Project ID:", db.app.options.projectId);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("✅ Firestore userData:", JSON.stringify(userData));
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || undefined,
              username: userData.username || "User",
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: userData.createdAt?.toDate() || new Date(),
              lastLoginAt: new Date(),
            });
          } else {
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || undefined,
              username: firebaseUser.displayName || "User",
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: new Date(),
              lastLoginAt: new Date(),
            };
            setUser(newUser);
          }
        } else {
          console.log("AuthContext: No user found");
          setUser(null);
        }
      } catch (err) {
        console.error("AuthContext: Auth state change error:", err);
        // If Firestore fails (e.g. offline), still set the user with basic info
        if (firebaseUser) {
          const fallbackUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            username: firebaseUser.displayName || "User",
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          };
          setUser(fallbackUser);
        } else {
          setError(
            err instanceof Error ? err : new Error("Unknown auth error")
          );
        }
      } finally {
        console.log("AuthContext: setLoading(false)");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
