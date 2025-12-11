import { User } from "./user";

export interface Study {
  studyId: string;
  studyName: string;
  description?: string;
  bookTitle: string;
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
  memberId: string;
  studyId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
  isActive: boolean;
  user?: User; // Joined user data
  progressRate?: number;
}

export interface DayPlan {
  planId: string;
  studyId: string;
  dayNumber: number;
  title: string;
  learningGoal: string;
  chapterInfo?: string;
  description?: string;
  targetDate?: Date;
}

export interface Assignment {
  assignmentId: string;
  planId: string;
  questionText: string;
  questionOrder: number;
  isRequired: boolean;
}

export interface Submission {
  submissionId: string;
  planId: string;
  studyId: string;
  userId: string;
  dayNumber: number;
  answers: SubmissionAnswer[];
  reflection?: string;
  isCompleted: boolean;
  submittedAt: Date;
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
  commentId: string;
  submissionId: string;
  studyId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean; // Track if comment is deleted
  user?: User; // Joined user data
}
