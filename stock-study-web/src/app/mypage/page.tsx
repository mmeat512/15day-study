"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { ProfileCard } from "../../components/mypage/ProfileCard";
import { StatsCard } from "../../components/mypage/StatsCard";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { getUserStudiesWithProgressAction } from "../../actions/studyActions";
import { getUserSubmissionsAction } from "../../actions/submissionActions";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";

export default function MyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudies: 0,
    completedStudies: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
    averageProgress: 0,
    studyDetails: [] as Array<{
      studyName: string;
      progress: number;
      submissions: number;
    }>,
  });

  useEffect(() => {
    async function loadStats() {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const studies = await getUserStudiesWithProgressAction(user.uid);

        // Calculate stats
        const totalStudies = studies.length;
        const completedStudies = studies.filter(
          (s) => s.study.status === "completed"
        ).length;

        // Get total submissions
        let totalSubmissions = 0;
        const studyDetails = [];

        for (const studyData of studies) {
          const submissions = await getUserSubmissionsAction(
            studyData.study.id,
            user.uid
          );
          const completedSubmissions = submissions.filter((s) => s.isCompleted).length;
          totalSubmissions += completedSubmissions;

          studyDetails.push({
            studyName: studyData.study.studyName,
            progress: studyData.memberInfo.progressRate || 0,
            submissions: completedSubmissions,
          });
        }

        // Calculate average progress
        const averageProgress =
          studies.length > 0
            ? Math.round(
                studies.reduce((sum, s) => sum + (s.memberInfo.progressRate || 0), 0) /
                  studies.length
              )
            : 0;

        setStats({
          totalStudies,
          completedStudies,
          totalAssignments: totalSubmissions,
          totalSubmissions,
          averageProgress,
          studyDetails,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Page
          </h1>

          <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="space-y-6">
              <ProfileCard user={user} />
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Activity Stats
              </h2>
              <StatsCard
                totalStudies={stats.totalStudies}
                completedStudies={stats.completedStudies}
                totalAssignments={stats.totalSubmissions}
              />

              {/* Overall Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Completion</span>
                        <span className="font-bold">{stats.averageProgress}%</span>
                      </div>
                      <Progress value={stats.averageProgress} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {stats.totalStudies}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Active Studies
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {stats.totalSubmissions}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Submissions
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {stats.completedStudies}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Completed
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Details */}
              {stats.studyDetails.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Study Progress Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.studyDetails.map((study, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {study.studyName}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {study.submissions} / 15 days
                            </span>
                          </div>
                          <Progress value={study.progress} />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {study.progress}% complete
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Learning Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.totalSubmissions > 0 ? (
                      <>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🔥</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Keep it up!
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              You've completed {stats.totalSubmissions} assignments across all studies.
                            </p>
                          </div>
                        </div>
                        {stats.averageProgress >= 50 && (
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">⭐</span>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Great Progress!
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                You're more than halfway through your studies!
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📚</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Get Started!
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Start submitting assignments to track your learning progress.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
