"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Loader2 } from "lucide-react";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";

export default function RegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if passwords match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match. Please try again.");
      }

      // Check if password is at least 6 characters
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      // Check if username already exists
      const q = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error("Username already taken. Please choose another one.");
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create user document in Firestore BEFORE updating profile
      // This ensures the document exists when AuthContext tries to read it
      console.log("🔥 Creating Firestore user document for:", user.uid);
      try {
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log("✅ Firestore user document created successfully!");
      } catch (firestoreError) {
        console.error("❌ Failed to create Firestore document:", firestoreError);
        throw new Error("Failed to create user profile. Please try again.");
      }

      // Update profile with username AFTER Firestore document is created
      await updateProfile(user, {
        displayName: username,
      });

      console.log("🚀 Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      
      // Rollback: try to delete the auth user if Firestore creation failed
      if (auth.currentUser) {
        try {
          await deleteUser(auth.currentUser);
          console.log("Rolled back: Deleted auth user due to Firestore failure");
        } catch (deleteErr) {
          console.error("Failed to rollback auth user:", deleteErr);
        }
      }

      setError(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Start your 15-day stock study challenge
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign up
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
          </span>
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
