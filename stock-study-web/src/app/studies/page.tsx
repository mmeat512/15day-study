"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Study } from "../../types/study";
import Link from "next/link";
import { Plus, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserStudiesWithProgressAction } from "../../actions/studyActions";

export default function StudyListPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studies, setStudies] = useState<
    Array<{
      study: Study;
      currentDay: number;
      progress: number;
      memberCount: number;
    }>
  >([]);

  useEffect(() => {
    async function loadStudies() {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const studiesData = await getUserStudiesWithProgressAction(user.uid);

        const studiesWithProgress = studiesData.map((data) => ({
          study: data.study,
          currentDay: data.currentDay,
          progress: Math.round((data.currentDay / 15) * 100),
          memberCount: data.memberCount,
        }));

        setStudies(studiesWithProgress);
      } catch (error) {
        console.error("Error loading studies:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStudies();
  }, [user]);

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
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Studies
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage and track your active studies
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/studies/join">
                <Button variant="outline">
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Study
                </Button>
              </Link>
              <Link href="/studies/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Study
                </Button>
              </Link>
            </div>
          </div>

          {studies.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow border border-gray-100 dark:border-gray-700 text-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                No Studies Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You haven't joined any studies yet. Create a new study or join
                an existing one to get started!
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/studies/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Study
                  </Button>
                </Link>
                <Link href="/studies/join">
                  <Button variant="outline">
                    <LogIn className="mr-2 h-4 w-4" />
                    Join Study
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {studies.map(({ study, currentDay, progress, memberCount }) => (
                <Card key={study.studyId} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {study.studyName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {study.bookTitle}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Day {currentDay} of 15</span>
                          <span>
                            {study.status === "active" ? "Active" : "Completed"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            {study.startDate.toLocaleDateString()} ~{" "}
                            {study.endDate.toLocaleDateString()}
                          </span>
                          <span>
                            {memberCount}/{study.maxMembers} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/studies/${study.studyId}`}
                      className="w-full"
                    >
                      <Button variant="secondary" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
