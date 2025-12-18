import { db } from '@/lib/db';
import {
  submissions,
  comments,
  studyMembers,
  type Submission,
  type Comment,
} from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Define SubmissionAnswer type to match the existing type
export type SubmissionAnswer = {
  assignmentId: string;
  questionText: string;
  answerText: string;
  isRequired: boolean;
};

/**
 * Create or update a submission (upsert)
 */
export async function createSubmission(submissionData: {
  planId: string;
  studyId: string;
  userId: string;
  dayNumber: number;
  answers: SubmissionAnswer[];
  reflection?: string;
}): Promise<string> {
  // Check if submission already exists
  const existingSubmission = await db.query.submissions.findFirst({
    where: and(
      eq(submissions.planId, submissionData.planId),
      eq(submissions.userId, submissionData.userId),
    ),
  });

  if (existingSubmission) {
    // Update existing submission
    await db
      .update(submissions)
      .set({
        answers: submissionData.answers as any,
        reflection: submissionData.reflection,
        isCompleted: true,
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, existingSubmission.id));

    return existingSubmission.id;
  } else {
    // Create new submission
    const submissionId = nanoid();

    await db.insert(submissions).values({
      id: submissionId,
      planId: submissionData.planId,
      studyId: submissionData.studyId,
      userId: submissionData.userId,
      dayNumber: submissionData.dayNumber,
      answers: submissionData.answers as any,
      reflection: submissionData.reflection,
      isCompleted: true,
      submittedAt: new Date(),
    });

    return submissionId;
  }
}

/**
 * Get submission for a specific day and user
 */
export async function getSubmission(
  planId: string,
  userId: string,
): Promise<Submission | null> {
  const submission = await db.query.submissions.findFirst({
    where: and(eq(submissions.planId, planId), eq(submissions.userId, userId)),
  });

  if (!submission) {
    return null;
  }

  return {
    ...submission,
    answers: submission.answers as unknown as SubmissionAnswer[],
  } as Submission;
}

/**
 * Get all submissions for a user in a study
 */
export async function getUserSubmissions(
  studyId: string,
  userId: string,
): Promise<Submission[]> {
  const userSubmissions = await db.query.submissions.findMany({
    where: and(
      eq(submissions.studyId, studyId),
      eq(submissions.userId, userId),
    ),
    orderBy: (submissions, { asc }) => [asc(submissions.dayNumber)],
  });

  return userSubmissions.map(submission => ({
    ...submission,
    answers: submission.answers as unknown as SubmissionAnswer[],
  })) as Submission[];
}

/**
 * Get all submissions for a specific day plan
 */
export async function getDaySubmissions(planId: string): Promise<Submission[]> {
  const daySubmissions = await db.query.submissions.findMany({
    where: eq(submissions.planId, planId),
    orderBy: (submissions, { desc }) => [desc(submissions.submittedAt)],
  });

  return daySubmissions.map(submission => ({
    ...submission,
    answers: submission.answers as unknown as SubmissionAnswer[],
  })) as Submission[];
}

/**
 * Create a comment on a submission
 */
export async function createComment(
  submissionId: string,
  studyId: string,
  userId: string,
  content: string,
): Promise<string> {
  const commentId = nanoid();

  await db.insert(comments).values({
    id: commentId,
    submissionId,
    studyId,
    userId,
    content,
  });

  return commentId;
}

/**
 * Get comments for a submission
 * Filters out soft-deleted comments
 * Includes user data for each comment
 */
export async function getComments(submissionId: string): Promise<Comment[]> {
  const submissionComments = await db.query.comments.findMany({
    where: and(
      eq(comments.submissionId, submissionId),
      eq(comments.isDeleted, false),
    ),
    orderBy: (comments, { asc }) => [asc(comments.createdAt)],
    with: {
      user: true,
    },
  });

  return submissionComments;
}

/**
 * Update comment
 */
export async function updateComment(
  commentId: string,
  content: string,
): Promise<void> {
  await db
    .update(comments)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId));
}

/**
 * Delete comment (soft delete)
 */
export async function deleteComment(commentId: string): Promise<void> {
  await db
    .update(comments)
    .set({
      isDeleted: true,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId));
}

/**
 * Calculate and update progress rate for a user in a study
 */
export async function updateProgressRate(
  studyId: string,
  userId: string,
): Promise<number> {
  // Get total completed submissions for this user in this study
  const userSubmissions = await getUserSubmissions(studyId, userId);
  const completedSubmissions = userSubmissions.filter(
    s => s.isCompleted,
  ).length;

  // Calculate progress rate (out of 15 days)
  const progressRate = Math.round((completedSubmissions / 15) * 100);

  // Update studyMember progressRate
  const member = await db.query.studyMembers.findFirst({
    where: and(
      eq(studyMembers.studyId, studyId),
      eq(studyMembers.userId, userId),
    ),
  });

  if (member) {
    await db
      .update(studyMembers)
      .set({ progressRate })
      .where(eq(studyMembers.id, member.id));
  }

  return progressRate;
}
