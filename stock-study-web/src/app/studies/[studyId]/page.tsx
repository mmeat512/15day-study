'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import {
  Loader2,
  ArrowLeft,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  Circle,
  LogOut,
} from 'lucide-react';
import { Study, StudyMember, DayPlan } from '../../../types/study';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getStudyByIdAction,
  getStudyMembersAction,
  getDayPlansAction,
  getUserStudyMemberAction,
  leaveStudyAction,
} from '../../../actions/studyActions';
import { getUserSubmissionsAction } from '../../../actions/submissionActions';
import Link from 'next/link';

export default function StudyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [study, setStudy] = useState<Study | null>(null);
  const [members, setMembers] = useState<StudyMember[]>([]);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [userProgress, setUserProgress] = useState(0);
  const [userMember, setUserMember] = useState<StudyMember | null>(null);
  const [leaving, setLeaving] = useState(false);

  const studyId = params.studyId as string;

  useEffect(() => {
    async function loadStudyDetails() {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Get study details
        const studyData = await getStudyByIdAction(studyId);
        if (!studyData) {
          console.error('Study not found');
          return;
        }
        setStudy(studyData);

        // Get members
        const membersData = await getStudyMembersAction(studyId);
        setMembers(membersData);

        // Get day plans
        const dayPlansData = await getDayPlansAction(studyId);
        setDayPlans(dayPlansData);

        // Get user's submissions to check completed days
        const submissions = await getUserSubmissionsAction(studyId, user.uid);
        const completed = new Set(
          submissions.filter(s => s.isCompleted).map(s => s.dayNumber),
        );
        setCompletedDays(completed);

        // Get user's progress
        const memberInfo = await getUserStudyMemberAction(studyId, user.uid);
        if (memberInfo) {
          setUserProgress(memberInfo.progressRate || 0);
          setUserMember(memberInfo);
        }
      } catch (error) {
        console.error('Error loading study details:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStudyDetails();
  }, [studyId, user]);

  async function handleLeaveStudy() {
    if (!user?.uid || !study) return;

    if (
      !confirm(
        `Are you sure you want to leave "${study.studyName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setLeaving(true);
      await leaveStudyAction(studyId, user.uid);
      alert('You have successfully left the study.');
      router.push('/studies');
    } catch (error: any) {
      console.error('Error leaving study:', error);
      alert(error.message || 'Failed to leave study. Please try again.');
    } finally {
      setLeaving(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!study) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow border border-gray-100 dark:border-gray-700 text-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Study Not Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The study you're looking for doesn't exist or you don't have
                access to it.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {study.studyName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {study.description || 'No description available'}
              </p>
            </div>
            {userMember && userMember.role !== 'owner' && (
              <Button
                variant="destructive"
                onClick={handleLeaveStudy}
                disabled={leaving}
              >
                {leaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Leave Study
              </Button>
            )}
          </div>

          {/* Study Info Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Study Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Study Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Book
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {study.bookTitle}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {study.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Invite Code
                  </p>
                  <p className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {study.inviteCode}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Duration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Start Date
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {study.startDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    End Date
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {study.endDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Days
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    15 Days
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Your Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      Completion
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {userProgress}%
                    </span>
                  </div>
                  <Progress value={userProgress} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Completed Days
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {completedDays.size} / 15
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Members Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({members.length}/{study.maxMembers})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {member.user?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {member.user?.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {member.role}
                        {member.progressRate !== undefined && (
                          <> • {member.progressRate}% complete</>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 15-Day Learning Plan */}
          <Card>
            <CardHeader>
              <CardTitle>15-Day Learning Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dayPlans.map(dayPlan => {
                  const isCompleted = completedDays.has(dayPlan.dayNumber);

                  return (
                    <Link
                      key={dayPlan.id}
                      href={`/studies/${studyId}/day/${dayPlan.dayNumber}`}
                    >
                      <div
                        className={`
                          p-4 rounded-lg border transition-all cursor-pointer
                          ${
                            isCompleted
                              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              Day {dayPlan.dayNumber}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {dayPlan.title}
                            </p>
                            {dayPlan.chapterInfo && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {dayPlan.chapterInfo}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
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
