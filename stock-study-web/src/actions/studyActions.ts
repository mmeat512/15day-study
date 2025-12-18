'use server';

import * as studyService from '@/services/studyService';
import type { Study, DayPlan, Assignment, StudyMember } from '@/db/schema';

/**
 * Server Actions for study operations
 * These can be called from Client Components
 */

export async function createStudyAction(
  studyData: {
    studyName: string;
    description?: string;
    bookTitle: string;
    startDate: Date;
    endDate: Date;
    maxMembers: number;
  },
  ownerId: string,
) {
  return studyService.createStudy(studyData, ownerId);
}

export async function joinStudyAction(inviteCode: string, userId: string) {
  return studyService.joinStudy(inviteCode, userId);
}

export async function leaveStudyAction(studyId: string, userId: string) {
  return studyService.leaveStudy(studyId, userId);
}

export async function deleteStudyAction(studyId: string, userId: string) {
  return studyService.deleteStudy(studyId, userId);
}

export async function getUserStudiesAction(userId: string): Promise<Study[]> {
  return studyService.getUserStudies(userId);
}

export async function getStudyAction(studyId: string): Promise<Study | null> {
  return studyService.getStudy(studyId);
}

export async function getDayPlansAction(studyId: string): Promise<DayPlan[]> {
  return studyService.getDayPlans(studyId);
}

export async function getAssignmentsAction(
  planId: string,
): Promise<Assignment[]> {
  return studyService.getAssignments(planId);
}

export async function getUserStudyMemberAction(
  userId: string,
  studyId: string,
): Promise<StudyMember | null> {
  return studyService.getUserStudyMember(userId, studyId);
}

export async function getStudyWithMemberCountAction(studyId: string) {
  return studyService.getStudyWithMemberCount(studyId);
}

export async function getUserStudiesWithProgressAction(userId: string) {
  return studyService.getUserStudiesWithProgress(userId);
}

export async function getStudyByIdAction(
  studyId: string,
): Promise<Study | null> {
  return studyService.getStudyById(studyId);
}

export async function getStudyMembersAction(
  studyId: string,
): Promise<StudyMember[]> {
  return studyService.getStudyMembers(studyId);
}
