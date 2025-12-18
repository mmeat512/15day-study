import { User } from "./user";

export interface Study {
  id: string;
  studyName: string;
  description: string | null;
  bookTitle: string | null;
  inviteCode: string;
  startDate: Date;
  endDate: Date;
  ownerId: string;
  status: "active" | "completed" | "archived";
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyMember {
  id: string;
  studyId: string;
  userId: string;
  role: "owner" | "member";
  joinedAt: Date;
  isActive: boolean;
  user?: User; // Joined user data
  progressRate: number;
}

export interface DayPlan {
  id: string;
  studyId: string;
  dayNumber: number;
  title: string;
  learningGoal: string | null;
  chapterInfo: string | null;
  description: string | null;
  targetDate: Date;
}

export interface Assignment {
  id: string;
  planId: string;
  questionText: string;
  questionOrder: number;
  isRequired: boolean;
}

export interface Submission {
  id: string;
  planId: string;
  studyId: string;
  userId: string;
  dayNumber: number;
  answers: any; // JSONB type
  reflection: string | null;
  isCompleted: boolean;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionAnswer {
  assignmentId: string;
  questionText: string;
  answerText: string;
  isRequired: boolean;
}

export interface Comment {
  id: string;
  submissionId: string;
  studyId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  user?: User; // Joined user data
}
