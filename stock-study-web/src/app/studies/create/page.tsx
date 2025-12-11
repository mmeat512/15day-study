"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { createStudy } from "../../../services/studyService";

export default function CreateStudyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    studyName: "",
    description: "",
    bookTitle: "",
    startDate: "",
    endDate: "",
    maxMembers: 10,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be logged in to create a study");
      return;
    }

    setLoading(true);

    try {
      const { studyId, inviteCode } = await createStudy(
        {
          studyName: formData.studyName,
          description: formData.description || undefined,
          bookTitle: formData.bookTitle,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          maxMembers: Number(formData.maxMembers),
        },
        user.uid
      );

      console.log("Study created successfully!", { studyId, inviteCode });
      alert(
        `Study created successfully!\n\nInvite Code: ${inviteCode}\n\nShare this code with your friends to invite them!`
      );
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error creating study:", err);
      setError(err.message || "Failed to create study. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Create New Study
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Study Name
                </label>
                <Input
                  name="studyName"
                  value={formData.studyName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. January Stock Study"
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of your study group"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Book Title
                </label>
                <Input
                  name="bookTitle"
                  value={formData.bookTitle}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Stock Investment for Beginners"
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Start Date
                  </label>
                  <Input
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    End Date
                  </label>
                  <Input
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Max Members
                </label>
                <Input
                  name="maxMembers"
                  type="number"
                  min={1}
                  max={50}
                  value={formData.maxMembers}
                  onChange={handleChange}
                  required
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Study
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
