"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../../../../components/ProtectedRoute";
import { DayHeader } from "../../../../../components/study/DayHeader";
import { AssignmentSection } from "../../../../../components/study/AssignmentSection";
import { ReflectionSection } from "../../../../../components/study/ReflectionSection";
import { CommentsSection } from "../../../../../components/study/CommentsSection";
import { Button } from "../../../../../components/ui/button";
import { Loader2, Save } from "lucide-react";
import { DayPlan, Assignment, SubmissionAnswer } from "../../../../../types/study";
import {
  getDayPlans,
  getAssignments,
} from "../../../../../services/studyService";
import {
  createSubmission,
  getSubmission,
  updateProgressRate,
} from "../../../../../services/submissionService";
import { useAuth } from "../../../../../contexts/AuthContext";

export default function DayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [reflection, setReflection] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const studyId = params.studyId as string;
  const dayNumber = parseInt(params.dayNumber as string);

  useEffect(() => {
    async function loadDayData() {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Get day plans for this study
        const dayPlans = await getDayPlans(studyId);

        // Find the specific day
        const currentDayPlan = dayPlans.find(
          (plan) => plan.dayNumber === dayNumber
        );

        if (!currentDayPlan) {
          console.error(`Day ${dayNumber} not found`);
          return;
        }

        setDayPlan(currentDayPlan);

        // Get assignments for this day
        const dayAssignments = await getAssignments(currentDayPlan.planId);
        setAssignments(dayAssignments);

        // Check if user has already submitted
        const existingSubmission = await getSubmission(
          currentDayPlan.planId,
          user.uid
        );

        if (existingSubmission) {
          setIsSubmitted(true);
          setSubmissionId(existingSubmission.submissionId);
          // Load existing answers
          const loadedAnswers: { [key: string]: string } = {};
          existingSubmission.answers.forEach((answer) => {
            loadedAnswers[answer.assignmentId] = answer.answerText;
          });
          setAnswers(loadedAnswers);
          setReflection(existingSubmission.reflection || "");
        }
      } catch (error) {
        console.error("Error loading day data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDayData();
  }, [studyId, dayNumber, user]);

  const handleSave = async () => {
    if (!user?.uid || !dayPlan) return;

    setSaving(true);

    try {
      // Validate required answers
      const requiredAssignments = assignments.filter((a) => a.isRequired);
      const missingAnswers = requiredAssignments.filter(
        (a) => !answers[a.assignmentId] || answers[a.assignmentId].trim() === ""
      );

      if (missingAnswers.length > 0) {
        alert("Please answer all required questions before submitting.");
        setSaving(false);
        return;
      }

      // Prepare submission answers
      const submissionAnswers: SubmissionAnswer[] = assignments.map((assignment) => ({
        assignmentId: assignment.assignmentId,
        questionText: assignment.questionText,
        answerText: answers[assignment.assignmentId] || "",
        isRequired: assignment.isRequired,
      }));

      // Create submission
      const newSubmissionId = await createSubmission({
        planId: dayPlan.planId,
        studyId: studyId,
        userId: user.uid,
        dayNumber: dayNumber,
        answers: submissionAnswers,
        reflection: reflection,
      });

      // Update progress rate
      await updateProgressRate(studyId, user.uid);

      setIsSubmitted(true);
      setSubmissionId(newSubmissionId);
      alert("Assignment submitted successfully! 🎉");
      // Don't redirect to dashboard, stay on page to see comments
      // router.push("/dashboard");
    } catch (error) {
      console.error("Error saving submission:", error);
      alert("Failed to submit assignment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!dayPlan) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow border border-gray-100 dark:border-gray-700 text-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Day Not Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The requested day could not be found.
              </p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>

          <DayHeader
            dayNumber={dayPlan.dayNumber}
            title={dayPlan.title}
            chapterInfo={dayPlan.chapterInfo}
            isCompleted={false}
          />

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🎯 Learning Goal
            </h3>
            <p className="text-blue-800 dark:text-blue-200">
              {dayPlan.learningGoal}
            </p>
          </div>

          {isSubmitted && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200 font-medium">
                ✅ You have already submitted this assignment
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                You can view your answers below and make changes if needed.
              </p>
            </div>
          )}

          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment, index) => (
                <div
                  key={assignment.assignmentId}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      Q{index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {assignment.questionText}
                        {assignment.isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </p>
                      {!assignment.isRequired && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          (Optional)
                        </span>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={answers[assignment.assignmentId] || ""}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        [assignment.assignmentId]: e.target.value,
                      })
                    }
                    placeholder="Write your answer here..."
                    rows={4}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                No assignments available for this day.
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              📝 Daily Reflection
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Take a moment to reflect on today's learning and write down your thoughts.
            </p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you learn today? Any challenges or insights?"
              rows={6}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between items-center pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isSubmitted ? "Update your submission" : "All required fields must be filled"}
            </p>
            <Button size="lg" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSubmitted ? "Update Submission" : "Submit Assignment"}
            </Button>
          </div>

          {/* Comments Section - Only show after submission */}
          {isSubmitted && submissionId && (
            <div className="mt-8">
              <CommentsSection
                submissionId={submissionId}
                studyId={studyId}
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
