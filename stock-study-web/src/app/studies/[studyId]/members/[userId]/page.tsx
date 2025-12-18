"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../../../../components/ProtectedRoute";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Progress } from "../../../../../components/ui/progress";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Award,
  TrendingUp,
} from "lucide-react";
import {
  StudyMember,
  DayPlan,
  Submission,
  SubmissionAnswer,
  Study,
} from "../../../../../types/study";
import {
  getUserStudyMemberAction,
  getDayPlansAction,
  getStudyByIdAction,
} from "../../../../../actions/studyActions";
import { getUserSubmissionsAction } from "../../../../../actions/submissionActions";
import { useAuth } from "../../../../../contexts/AuthContext";

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<StudyMember | null>(null);
  const [study, setStudy] = useState<Study | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const studyId = params.studyId as string;
  const userId = params.userId as string;

  useEffect(() => {
    async function loadMemberProfile() {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Get member info
        const memberData = await getUserStudyMemberAction(userId, studyId);
        if (!memberData) {
          console.error("Member not found");
          return;
        }
        setMember(memberData);

        // Get study info
        const studyData = await getStudyByIdAction(studyId);
        setStudy(studyData);

        // Get day plans
        const plansData = await getDayPlansAction(studyId);
        setDayPlans(plansData);

        // Get member's submissions
        const submissionsData = await getUserSubmissionsAction(studyId, userId);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error loading member profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMemberProfile();
  }, [studyId, userId, user]);

  // Calculate statistics
  const completedDays = submissions.filter((s) => s.isCompleted).length;
  const progressRate = Math.round((completedDays / 15) * 100);
  const remainingDays = 15 - completedDays;

  // Calculate streak (consecutive days)
  const calculateStreak = () => {
    const completedDayNumbers = submissions
      .filter((s) => s.isCompleted)
      .map((s) => s.dayNumber)
      .sort((a, b) => a - b);

    let currentStreak = 0;
    let maxStreak = 0;

    for (let i = 0; i < completedDayNumbers.length; i++) {
      if (
        i === 0 ||
        completedDayNumbers[i] === completedDayNumbers[i - 1] + 1
      ) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  const maxStreak = calculateStreak();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!member || !study) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow border border-gray-100 dark:border-gray-700 text-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Member Not Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The member profile you're looking for doesn't exist.
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
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Member Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {study.studyName}
              </p>
            </div>
          </div>

          {/* Member Info Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {member.user?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {member.user?.username || "Anonymous"}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 capitalize mt-1">
                    {member.role} • Joined{" "}
                    {member.joinedAt.toLocaleDateString()}
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Overall Progress
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {progressRate}%
                      </span>
                    </div>
                    <Progress value={progressRate} className="h-3" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Completed Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {completedDays}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">/ 15</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Remaining Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {remainingDays}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Max Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {maxStreak}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Progress Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {progressRate}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                15-Day Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dayPlans.map((dayPlan) => {
                  const submission = submissions.find(
                    (s) => s.dayNumber === dayPlan.dayNumber
                  );
                  const isCompleted = submission?.isCompleted || false;
                  const isExpanded = expandedDay === dayPlan.dayNumber;

                  return (
                    <div
                      key={dayPlan.id}
                      className={`border rounded-lg transition-all ${
                        isCompleted
                          ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() =>
                          setExpandedDay(
                            isExpanded ? null : dayPlan.dayNumber
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Day {dayPlan.dayNumber}: {dayPlan.title}
                              </p>
                              {isCompleted && submission && (
                                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {submission.submittedAt?.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {dayPlan.chapterInfo && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {dayPlan.chapterInfo}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Submission Details */}
                      {isExpanded && submission && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                              Submitted on{" "}
                              {submission.submittedAt?.toLocaleDateString()} at{" "}
                              {submission.submittedAt?.toLocaleTimeString()}
                            </p>

                            {/* Answers */}
                            <div className="space-y-3">
                              {(
                                submission.answers as SubmissionAnswer[]
                              ).map((answer, index) => (
                                <div
                                  key={answer.assignmentId}
                                  className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg"
                                >
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Q{index + 1}. {answer.questionText}
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap pl-4 border-l-2 border-blue-500 dark:border-blue-400">
                                    {answer.answerText || (
                                      <span className="italic text-gray-400">
                                        No answer provided
                                      </span>
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Reflection */}
                            {submission.reflection && (
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  📝 Daily Reflection
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap pl-4 border-l-2 border-green-500 dark:border-green-400">
                                  {submission.reflection}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Not Submitted Message */}
                      {isExpanded && !submission && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center">
                            Not submitted yet
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
