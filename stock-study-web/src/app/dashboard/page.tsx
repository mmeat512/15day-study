"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { StudyOverviewCard } from "../../components/dashboard/StudyOverviewCard";
import { TodayAssignmentCard } from "../../components/dashboard/TodayAssignmentCard";
import { useAuth } from "../../contexts/AuthContext";
import { Study, DayPlan } from "../../types/study";
import {
  getUserStudiesWithProgress,
  getDayPlans,
  getCurrentDayNumber,
} from "../../services/studyService";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [primaryStudy, setPrimaryStudy] = useState<Study | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [totalDays] = useState(15);
  const [progress, setProgress] = useState(0);
  const [todayDayPlan, setTodayDayPlan] = useState<DayPlan | null>(null);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.uid) {
        console.warn("⚠️ No user UID found");
        return;
      }

      try {
        setLoading(true);
        console.log("🚀 Loading dashboard data for user:", user.uid);

        // Get user's studies with progress
        const studies = await getUserStudiesWithProgress(user.uid);
        console.log("📊 Dashboard received studies:", studies);

        if (studies.length > 0) {
          // Get the first active study as primary
          const primaryStudyData = studies[0];
          setPrimaryStudy(primaryStudyData.study);
          setCurrentDay(primaryStudyData.currentDay);

          // Calculate progress
          const calculatedProgress = Math.round(
            (primaryStudyData.currentDay / totalDays) * 100
          );
          setProgress(Math.min(100, calculatedProgress));

          // Get day plans for this study
          const dayPlans = await getDayPlans(primaryStudyData.study.studyId);

          // Find today's day plan
          const todayPlan = dayPlans.find(
            (plan) => plan.dayNumber === primaryStudyData.currentDay
          );

          if (todayPlan) {
            setTodayDayPlan(todayPlan);
          }

          // Calculate total submissions (mock for now, will be real when submission feature is added)
          setTotalSubmissions(primaryStudyData.memberInfo.progressRate || 0);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, totalDays]);

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Welcome back, {user?.username}
              </p>
            </div>
          </div>

          {!primaryStudy ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow border border-gray-100 dark:border-gray-700 text-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                No Active Studies
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You haven't joined any studies yet. Create a new study or join
                an existing one to get started!
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/studies/create">
                  <Button>Create Study</Button>
                </Link>
                <Link href="/studies/join">
                  <Button variant="outline">Join Study</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <StudyOverviewCard
                  study={primaryStudy}
                  currentDay={currentDay}
                  totalDays={totalDays}
                  progress={progress}
                />
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                    Your Stats
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Submissions
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {totalSubmissions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Current Day
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        Day {currentDay}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Today's Assignment
                </h2>
                {todayDayPlan ? (
                  <TodayAssignmentCard
                    dayPlan={todayDayPlan}
                    isCompleted={false}
                  />
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">
                      No assignment available for today.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
