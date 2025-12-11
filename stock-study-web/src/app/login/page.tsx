"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Loader2 } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  // Legacy code: Email-based login
  // const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let emailToUse = username;

      // Check if input is an email
      const isEmail = username.includes("@");

      if (!isEmail) {
        // If not email, lookup email by username
        const q = query(
          collection(db, "users"),
          where("username", "==", username)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("User not found.");
        }

        const userDoc = querySnapshot.docs[0];
        emailToUse = userDoc.data().email;
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      // Improve error message based on error code
      if (err.message === "User not found.") {
        setError("User not found. Please check your username.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid credentials. Please check your password.");
      } else if (err.code === "auth/user-not-found") {
        setError("User not found. Please check your email/username.");
      } else if (err.code === "auth/wrong-password") {
        setError("Invalid password.");
      } else {
        setError("Failed to login. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to continue your stock study journey
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              {/* Legacy code: Email input
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
              */}
              <label htmlFor="username" className="sr-only">
                Email or Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="Email or Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                autoComplete="current-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
          </span>
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
