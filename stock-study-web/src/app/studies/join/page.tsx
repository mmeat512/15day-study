"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { joinStudy } from "../../../services/studyService";

export default function JoinStudyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be logged in to join a study");
      return;
    }

    setLoading(true);

    try {
      const studyId = await joinStudy(
        inviteCode.trim().toUpperCase(),
        user.uid
      );

      console.log("Joined study successfully!", { studyId });
      alert("Successfully joined the study!");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error joining study:", err);
      setError(err.message || "Failed to join study. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Join a Study
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Enter the invite code shared by your study leader.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Invite Code
              </label>
              <Input
                name="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                placeholder="e.g. ABC12345"
                className="text-center text-lg tracking-widest uppercase dark:bg-gray-700 dark:text-white"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Join Study
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
