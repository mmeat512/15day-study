"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "../../../../../components/ProtectedRoute";
import { DayHeader } from "../../../../../components/study/DayHeader";
import { AssignmentSection } from "../../../../../components/study/AssignmentSection";
import { ReflectionSection } from "../../../../../components/study/ReflectionSection";
import { CommentsSection } from "../../../../../components/study/CommentsSection";
import { Button } from "../../../../../components/ui/button";
import { Loader2, Save, Users, ChevronDown, ChevronUp } from "lucide-react";
import { DayPlan, Assignment, SubmissionAnswer, Submission, StudyMember } from "../../../../../types/study";
import {
  getDayPlansAction,
  getAssignmentsAction,
  getStudyMembersAction,
} from "../../../../../actions/studyActions";
import {
  createSubmissionAction,
  getSubmissionAction,
  getDaySubmissionsAction,
  updateProgressRateAction,
  getCommentsAction,
} from "../../../../../actions/submissionActions";
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
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [studyMembers, setStudyMembers] = useState<StudyMember[]>([]);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});

  const studyId = params.studyId as string;
  const dayNumber = parseInt(params.dayNumber as string);

  useEffect(() => {
    async function loadDayData() {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Get day plans for this study
        const dayPlans = await getDayPlansAction(studyId);

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
        const dayAssignments = await getAssignmentsAction(currentDayPlan.id);
        setAssignments(dayAssignments);

        // Check if user has already submitted
        const existingSubmission = await getSubmissionAction(
          currentDayPlan.id,
          user.uid
        );

        if (existingSubmission) {
          setIsSubmitted(true);
          setSubmissionId(existingSubmission.id);
          // Load existing answers
          const loadedAnswers: { [key: string]: string } = {};
          const submissionAnswers = existingSubmission.answers as SubmissionAnswer[];
          submissionAnswers.forEach((answer) => {
            loadedAnswers[answer.assignmentId] = answer.answerText;
          });
          setAnswers(loadedAnswers);
          setReflection(existingSubmission.reflection || "");
        }

        // Load all submissions for this day
        const daySubmissions = await getDaySubmissionsAction(currentDayPlan.id);
        setAllSubmissions(daySubmissions);

        // Load study members to display names
        const members = await getStudyMembersAction(studyId);
        setStudyMembers(members);

        // Load comment counts for all submissions
        const counts: { [key: string]: number } = {};
        for (const submission of daySubmissions) {
          const comments = await getCommentsAction(submission.id);
          counts[submission.id] = comments.length;
        }
        setCommentCounts(counts);
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
        (a) => !answers[a.id] || answers[a.id].trim() === ""
      );

      if (missingAnswers.length > 0) {
        alert("Please answer all required questions before submitting.");
        setSaving(false);
        return;
      }

      // Prepare submission answers
      const submissionAnswers: SubmissionAnswer[] = assignments.map((assignment) => ({
        assignmentId: assignment.id,
        questionText: assignment.questionText,
        answerText: answers[assignment.id] || "",
        isRequired: assignment.isRequired,
      }));

      // Create submission
      const newSubmissionId = await createSubmissionAction({
        planId: dayPlan.id,
        studyId: studyId,
        userId: user.uid,
        dayNumber: dayNumber,
        answers: submissionAnswers,
        reflection: reflection,
      });

      // Update progress rate
      await updateProgressRateAction(studyId, user.uid);

      setIsSubmitted(true);
      setSubmissionId(newSubmissionId);

      // Reload all submissions to show updated list
      if (dayPlan) {
        const daySubmissions = await getDaySubmissionsAction(dayPlan.id);
        setAllSubmissions(daySubmissions);
      }

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

  const toggleSubmissionExpand = (submissionId: string) => {
    setExpandedSubmissions((prev) => {
      const next = new Set(prev);
      if (next.has(submissionId)) {
        next.delete(submissionId);
      } else {
        next.add(submissionId);
      }
      return next;
    });
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
            chapterInfo={dayPlan.chapterInfo ?? undefined}
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
                  key={assignment.id}
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
                    value={answers[assignment.id] || ""}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        [assignment.id]: e.target.value,
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

          {/* All Submissions Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Member Submissions ({allSubmissions.length}/{studyMembers.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllSubmissions(!showAllSubmissions)}
              >
                {showAllSubmissions ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    View All
                  </>
                )}
              </Button>
            </div>

            {showAllSubmissions && (
              <div className="space-y-6 mt-6">
                {allSubmissions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No submissions yet for this day.
                  </p>
                ) : (
                  allSubmissions.map((submission) => {
                    const member = studyMembers.find(m => m.userId === submission.userId);
                    const submissionAnswers = submission.answers as SubmissionAnswer[];
                    const isExpanded = expandedSubmissions.has(submission.id);
                    const commentCount = commentCounts[submission.id] || 0;

                    return (
                      <div
                        key={submission.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
                      >
                        {/* Member Info Header - Clickable to expand/collapse */}
                        <div
                          className="flex items-center gap-3 p-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                          onClick={() => toggleSubmissionExpand(submission.id)}
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {member?.user?.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/studies/${studyId}/members/${submission.userId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                            >
                              {member?.user?.username || 'Anonymous'}
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Submitted {submission.submittedAt?.toLocaleDateString()} • {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </Button>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 dark:border-gray-700">
                            {/* Answers */}
                            <div className="p-5 space-y-4">
                              {submissionAnswers.map((answer, index) => (
                                <div key={answer.assignmentId}>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Q{index + 1}. {answer.questionText}
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-blue-500 dark:border-blue-400 whitespace-pre-wrap">
                                    {answer.answerText || <span className="italic text-gray-400">No answer provided</span>}
                                  </p>
                                </div>
                              ))}

                              {/* Reflection */}
                              {submission.reflection && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    📝 Daily Reflection
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-green-500 dark:border-green-400 whitespace-pre-wrap">
                                    {submission.reflection}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Comments Section */}
                            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                              <CommentsSection
                                submissionId={submission.id}
                                studyId={studyId}
                                onCommentCountChange={(newCount) => {
                                  setCommentCounts((prev) => ({
                                    ...prev,
                                    [submission.id]: newCount,
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Members who haven't submitted */}
                {studyMembers.length > allSubmissions.length && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                      Members who haven't submitted yet:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {studyMembers
                        .filter(member => !allSubmissions.some(sub => sub.userId === member.userId))
                        .map(member => (
                          <Link
                            key={member.id}
                            href={`/studies/${studyId}/members/${member.userId}`}
                          >
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                              <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                                {member.user?.username?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {member.user?.username || 'Anonymous'}
                              </span>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
