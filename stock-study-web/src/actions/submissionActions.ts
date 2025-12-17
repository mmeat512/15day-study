"use server";

import * as submissionService from "@/services/submissionService";
import type { Submission, Comment } from "@/db/schema";

/**
 * Server Actions for submission operations
 * These can be called from Client Components
 */

// Re-export the SubmissionAnswer type for use in Client Components
export type { SubmissionAnswer } from "@/services/submissionService";

export async function createSubmissionAction(submissionData: {
  planId: string;
  studyId: string;
  userId: string;
  dayNumber: number;
  answers: submissionService.SubmissionAnswer[];
  reflection?: string;
}): Promise<string> {
  return submissionService.createSubmission(submissionData);
}

export async function getSubmissionAction(
  planId: string,
  userId: string
): Promise<Submission | null> {
  return submissionService.getSubmission(planId, userId);
}

export async function getUserSubmissionsAction(
  studyId: string,
  userId: string
): Promise<Submission[]> {
  return submissionService.getUserSubmissions(studyId, userId);
}

export async function getDaySubmissionsAction(planId: string): Promise<Submission[]> {
  return submissionService.getDaySubmissions(planId);
}

export async function createCommentAction(
  submissionId: string,
  studyId: string,
  userId: string,
  content: string
): Promise<string> {
  return submissionService.createComment(submissionId, studyId, userId, content);
}

export async function getCommentsAction(submissionId: string): Promise<Comment[]> {
  return submissionService.getComments(submissionId);
}

export async function updateCommentAction(commentId: string, content: string): Promise<void> {
  return submissionService.updateComment(commentId, content);
}

export async function deleteCommentAction(commentId: string): Promise<void> {
  return submissionService.deleteComment(commentId);
}

export async function updateProgressRateAction(
  studyId: string,
  userId: string
): Promise<number> {
  return submissionService.updateProgressRate(studyId, userId);
}
