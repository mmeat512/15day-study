import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Submission, SubmissionAnswer, Comment } from "@/types/study";

/**
 * Create or update a submission
 */
export async function createSubmission(submissionData: {
  planId: string;
  studyId: string;
  userId: string;
  dayNumber: number;
  answers: SubmissionAnswer[];
  reflection?: string;
}): Promise<string> {
  try {
    // Check if submission already exists
    const submissionsRef = collection(db, "submissions");
    const q = query(
      submissionsRef,
      where("planId", "==", submissionData.planId),
      where("userId", "==", submissionData.userId)
    );
    const existingSnapshot = await getDocs(q);

    let submissionRef;
    let submissionId;

    if (!existingSnapshot.empty) {
      // Update existing submission
      const existingDoc = existingSnapshot.docs[0];
      submissionRef = doc(db, "submissions", existingDoc.id);
      submissionId = existingDoc.id;

      await updateDoc(submissionRef, {
        answers: submissionData.answers,
        reflection: submissionData.reflection,
        isCompleted: true,
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new submission
      submissionRef = doc(collection(db, "submissions"));
      submissionId = submissionRef.id;

      const submission: Omit<Submission, "submissionId"> = {
        planId: submissionData.planId,
        studyId: submissionData.studyId,
        userId: submissionData.userId,
        dayNumber: submissionData.dayNumber,
        answers: submissionData.answers,
        reflection: submissionData.reflection,
        isCompleted: true,
        submittedAt: serverTimestamp() as any,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      await setDoc(submissionRef, submission);
    }

    return submissionId;
  } catch (error) {
    console.error("Error creating submission:", error);
    throw error;
  }
}

/**
 * Get submission for a specific day and user
 */
export async function getSubmission(
  planId: string,
  userId: string
): Promise<Submission | null> {
  try {
    const submissionsRef = collection(db, "submissions");
    const q = query(
      submissionsRef,
      where("planId", "==", planId),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      submissionId: doc.id,
      planId: data.planId,
      studyId: data.studyId,
      userId: data.userId,
      dayNumber: data.dayNumber,
      answers: data.answers,
      reflection: data.reflection,
      isCompleted: data.isCompleted,
      submittedAt: data.submittedAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error getting submission:", error);
    throw error;
  }
}

/**
 * Get all submissions for a user in a study
 */
export async function getUserSubmissions(
  studyId: string,
  userId: string
): Promise<Submission[]> {
  try {
    const submissionsRef = collection(db, "submissions");
    // Removed orderBy to avoid requiring composite index
    // Will sort in memory instead
    const q = query(
      submissionsRef,
      where("studyId", "==", studyId),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);

    const submissions: Submission[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      submissions.push({
        submissionId: doc.id,
        planId: data.planId,
        studyId: data.studyId,
        userId: data.userId,
        dayNumber: data.dayNumber,
        answers: data.answers,
        reflection: data.reflection,
        isCompleted: data.isCompleted,
        submittedAt: data.submittedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    // Sort by dayNumber in memory
    submissions.sort((a, b) => a.dayNumber - b.dayNumber);

    return submissions;
  } catch (error) {
    console.error("Error getting user submissions:", error);
    throw error;
  }
}

/**
 * Get all submissions for a specific day plan
 */
export async function getDaySubmissions(planId: string): Promise<Submission[]> {
  try {
    const submissionsRef = collection(db, "submissions");
    const q = query(
      submissionsRef,
      where("planId", "==", planId),
      orderBy("submittedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const submissions: Submission[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      submissions.push({
        submissionId: doc.id,
        planId: data.planId,
        studyId: data.studyId,
        userId: data.userId,
        dayNumber: data.dayNumber,
        answers: data.answers,
        reflection: data.reflection,
        isCompleted: data.isCompleted,
        submittedAt: data.submittedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    return submissions;
  } catch (error) {
    console.error("Error getting day submissions:", error);
    throw error;
  }
}

/**
 * Create a comment on a submission
 */
export async function createComment(
  submissionId: string,
  studyId: string,
  userId: string,
  content: string
): Promise<string> {
  try {
    const commentRef = doc(collection(db, "comments"));
    const commentId = commentRef.id;

    const comment: Omit<Comment, "commentId"> = {
      submissionId,
      studyId,
      userId,
      content,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };

    await setDoc(commentRef, comment);

    return commentId;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

/**
 * Get comments for a submission
 */
export async function getComments(submissionId: string): Promise<Comment[]> {
  try {
    const commentsRef = collection(db, "comments");
    // Removed orderBy to avoid requiring composite index
    // Will sort in memory instead
    const q = query(commentsRef, where("submissionId", "==", submissionId));
    const querySnapshot = await getDocs(q);

    const comments: Comment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Skip deleted comments
      if (data.isDeleted) return;

      comments.push({
        commentId: doc.id,
        submissionId: data.submissionId,
        studyId: data.studyId,
        userId: data.userId,
        content: data.content,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isDeleted: data.isDeleted || false,
      });
    });

    // Sort by createdAt in memory (ascending - oldest first)
    comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return comments;
  } catch (error) {
    console.error("Error getting comments:", error);
    throw error;
  }
}

/**
 * Update comment
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<void> {
  try {
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, {
      content,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
}

/**
 * Delete comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}

/**
 * Calculate and update progress rate for a user in a study
 */
export async function updateProgressRate(
  studyId: string,
  userId: string
): Promise<number> {
  try {
    // Get total submissions for this user in this study
    const submissions = await getUserSubmissions(studyId, userId);
    const completedSubmissions = submissions.filter(
      (s) => s.isCompleted
    ).length;

    // Calculate progress rate (out of 15 days)
    const progressRate = Math.round((completedSubmissions / 15) * 100);

    // Update studyMember progressRate
    const membersRef = collection(db, "studyMembers");
    const q = query(
      membersRef,
      where("studyId", "==", studyId),
      where("userId", "==", userId)
    );
    const memberSnapshot = await getDocs(q);

    if (!memberSnapshot.empty) {
      const memberDoc = memberSnapshot.docs[0];
      const memberRef = doc(db, "studyMembers", memberDoc.id);
      await updateDoc(memberRef, {
        progressRate,
      });
    }

    return progressRate;
  } catch (error) {
    console.error("Error updating progress rate:", error);
    throw error;
  }
}
