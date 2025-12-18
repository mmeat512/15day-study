import { db } from '@/lib/db';
import {
  studies,
  studyMembers,
  dayPlans,
  assignments,
  users,
  type Study,
  type StudyMember,
  type DayPlan,
  type Assignment,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * Generate a random invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new study with 15 day plans and 45 assignments
 * Uses PostgreSQL transaction for atomicity
 */
export async function createStudy(
  studyData: {
    studyName: string;
    description?: string;
    bookTitle: string;
    startDate: Date;
    endDate: Date;
    maxMembers: number;
  },
  ownerId: string,
): Promise<{ studyId: string; inviteCode: string }> {
  const inviteCode = generateInviteCode();
  const studyId = nanoid();

  await db.transaction(async tx => {
    // 1. Create study
    await tx.insert(studies).values({
      id: studyId,
      studyName: studyData.studyName,
      description: studyData.description || '',
      bookTitle: studyData.bookTitle,
      inviteCode: inviteCode,
      startDate: studyData.startDate,
      endDate: studyData.endDate,
      ownerId: ownerId,
      status: 'active',
      maxMembers: studyData.maxMembers,
    });

    // 2. Add owner as first member
    await tx.insert(studyMembers).values({
      id: nanoid(),
      studyId: studyId,
      userId: ownerId,
      role: 'owner',
      isActive: true,
      progressRate: 0,
    });

    // 3. Create 15 day plans
    const dayPlanData = getDayPlanTemplates(studyId);
    const insertedPlans = await tx
      .insert(dayPlans)
      .values(dayPlanData)
      .returning();

    // 4. Create 3 assignments for each day plan (45 total)
    const assignmentData: Array<typeof assignments.$inferInsert> = [];
    for (const plan of insertedPlans) {
      assignmentData.push(...getAssignmentTemplates(plan.id));
    }
    await tx.insert(assignments).values(assignmentData);
  });

  return { studyId, inviteCode };
}

/**
 * Get day plan templates for a study
 */
function getDayPlanTemplates(
  studyId: string,
): Array<typeof dayPlans.$inferInsert> {
  const dayPlanTemplates = [
    {
      dayNumber: 1,
      title: 'Introduction to Stock Market',
      learningGoal:
        'Understand the basic concepts of stock market and investing',
      chapterInfo: 'Chapter 1',
    },
    {
      dayNumber: 2,
      title: 'Types of Stocks',
      learningGoal:
        'Learn about different types of stocks and their characteristics',
      chapterInfo: 'Chapter 2',
    },
    {
      dayNumber: 3,
      title: 'Reading Stock Charts',
      learningGoal:
        'Master the basics of reading and interpreting stock charts',
      chapterInfo: 'Chapter 3',
    },
    {
      dayNumber: 4,
      title: 'Market Analysis Fundamentals',
      learningGoal: 'Learn fundamental analysis techniques',
      chapterInfo: 'Chapter 4',
    },
    {
      dayNumber: 5,
      title: 'Financial Statements Analysis',
      learningGoal:
        'Understand balance sheets, income statements, and cash flow',
      chapterInfo: 'Chapter 5',
    },
    {
      dayNumber: 6,
      title: 'Technical Indicators',
      learningGoal: 'Learn about key technical indicators and their usage',
      chapterInfo: 'Chapter 6',
    },
    {
      dayNumber: 7,
      title: 'Risk Management',
      learningGoal: 'Understand risk management strategies in stock investing',
      chapterInfo: 'Chapter 7',
    },
    {
      dayNumber: 8,
      title: 'Portfolio Diversification',
      learningGoal: 'Learn how to build a diversified investment portfolio',
      chapterInfo: 'Chapter 8',
    },
    {
      dayNumber: 9,
      title: 'Market Trends and Cycles',
      learningGoal: 'Understand market cycles and trend analysis',
      chapterInfo: 'Chapter 9',
    },
    {
      dayNumber: 10,
      title: 'Investment Strategies',
      learningGoal:
        'Explore different investment strategies and when to use them',
      chapterInfo: 'Chapter 10',
    },
    {
      dayNumber: 11,
      title: 'Trading Psychology',
      learningGoal: 'Learn about emotional control and trading discipline',
      chapterInfo: 'Chapter 11',
    },
    {
      dayNumber: 12,
      title: 'Value Investing',
      learningGoal: 'Understand value investing principles and techniques',
      chapterInfo: 'Chapter 12',
    },
    {
      dayNumber: 13,
      title: 'Growth Investing',
      learningGoal: 'Learn about growth stock identification and analysis',
      chapterInfo: 'Chapter 13',
    },
    {
      dayNumber: 14,
      title: 'Market News and Information',
      learningGoal:
        'Learn how to interpret market news and use information effectively',
      chapterInfo: 'Chapter 14',
    },
    {
      dayNumber: 15,
      title: 'Building Your Investment Plan',
      learningGoal: 'Create a personalized investment plan and strategy',
      chapterInfo: 'Chapter 15',
    },
  ];

  return dayPlanTemplates.map(template => ({
    id: nanoid(),
    studyId: studyId,
    dayNumber: template.dayNumber,
    title: template.title,
    learningGoal: template.learningGoal,
    chapterInfo: template.chapterInfo,
    description: `Day ${template.dayNumber}: ${template.title}`,
    targetDate: new Date(), // Will be calculated based on start date in UI
  }));
}

/**
 * Get assignment templates for a day plan
 */
function getAssignmentTemplates(
  planId: string,
): Array<typeof assignments.$inferInsert> {
  return [
    {
      id: nanoid(),
      planId: planId,
      questionText: 'What are the key concepts you learned today?',
      questionOrder: 1,
      isRequired: true,
    },
    {
      id: nanoid(),
      planId: planId,
      questionText:
        "How can you apply today's learning to your investment strategy?",
      questionOrder: 2,
      isRequired: true,
    },
    {
      id: nanoid(),
      planId: planId,
      questionText: 'What questions or uncertainties do you still have?',
      questionOrder: 3,
      isRequired: false,
    },
  ];
}

/**
 * Join a study using invite code
 */
export async function joinStudy(
  inviteCode: string,
  userId: string,
): Promise<string> {
  // Find study by invite code
  const study = await db.query.studies.findFirst({
    where: eq(studies.inviteCode, inviteCode),
  });

  if (!study) {
    throw new Error('Invalid invite code');
  }

  // Check if user is already a member
  const existingMember = await db.query.studyMembers.findFirst({
    where: and(
      eq(studyMembers.studyId, study.id),
      eq(studyMembers.userId, userId),
    ),
  });

  if (existingMember) {
    throw new Error('You are already a member of this study');
  }

  // Check if study is full
  const allMembers = await db.query.studyMembers.findMany({
    where: eq(studyMembers.studyId, study.id),
  });

  if (allMembers.length >= study.maxMembers) {
    throw new Error('This study has reached its maximum capacity');
  }

  // Add user as member
  await db.insert(studyMembers).values({
    id: nanoid(),
    studyId: study.id,
    userId: userId,
    role: 'member',
    isActive: true,
    progressRate: 0,
  });

  return study.id;
}

/**
 * Leave a study (soft delete - set isActive to false)
 */
export async function leaveStudy(
  studyId: string,
  userId: string,
): Promise<void> {
  // Get the study member
  const member = await db.query.studyMembers.findFirst({
    where: and(
      eq(studyMembers.studyId, studyId),
      eq(studyMembers.userId, userId),
    ),
    with: {
      study: true,
    },
  });

  if (!member) {
    throw new Error('You are not a member of this study');
  }

  // Prevent owner from leaving (owner must transfer ownership or delete study)
  if (member.role === 'owner') {
    throw new Error(
      'Study owner cannot leave. Please delete the study or transfer ownership first.',
    );
  }

  // Soft delete: set isActive to false instead of deleting the record
  await db
    .update(studyMembers)
    .set({ isActive: false })
    .where(
      and(eq(studyMembers.studyId, studyId), eq(studyMembers.userId, userId)),
    );
}

/**
 * Get user's studies
 */
export async function getUserStudies(userId: string): Promise<Study[]> {
  const members = await db.query.studyMembers.findMany({
    where: and(
      eq(studyMembers.userId, userId),
      eq(studyMembers.isActive, true),
    ),
    with: {
      study: true,
    },
  });

  return members.map(member => member.study);
}

/**
 * Get study details
 */
export async function getStudy(studyId: string): Promise<Study | null> {
  const study = await db.query.studies.findFirst({
    where: eq(studies.id, studyId),
  });

  return study || null;
}

/**
 * Get day plans for a study
 */
export async function getDayPlans(studyId: string): Promise<DayPlan[]> {
  const plans = await db.query.dayPlans.findMany({
    where: eq(dayPlans.studyId, studyId),
    orderBy: (dayPlans, { asc }) => [asc(dayPlans.dayNumber)],
  });

  return plans;
}

/**
 * Get assignments for a day plan
 */
export async function getAssignments(planId: string): Promise<Assignment[]> {
  const assignmentList = await db.query.assignments.findMany({
    where: eq(assignments.planId, planId),
    orderBy: (assignments, { asc }) => [asc(assignments.questionOrder)],
  });

  return assignmentList;
}

/**
 * Get user's study member info for a specific study
 */
export async function getUserStudyMember(
  userId: string,
  studyId: string,
): Promise<StudyMember | null> {
  const member = await db.query.studyMembers.findFirst({
    where: and(
      eq(studyMembers.userId, userId),
      eq(studyMembers.studyId, studyId),
    ),
  });

  return member || null;
}

/**
 * Get current day number based on study start date
 */
export function getCurrentDayNumber(startDate: Date): number {
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentDay = diffDays + 1;

  // Return day between 1-15
  return Math.max(1, Math.min(15, currentDay));
}

/**
 * Get study with member count
 */
export async function getStudyWithMemberCount(
  studyId: string,
): Promise<{ study: Study; memberCount: number } | null> {
  const study = await getStudy(studyId);
  if (!study) {
    return null;
  }

  const members = await db.query.studyMembers.findMany({
    where: eq(studyMembers.studyId, studyId),
  });

  return {
    study,
    memberCount: members.length,
  };
}

/**
 * Get user's studies with progress info
 */
export async function getUserStudiesWithProgress(userId: string): Promise<
  Array<{
    study: Study;
    memberInfo: StudyMember;
    currentDay: number;
    memberCount: number;
  }>
> {
  const members = await db.query.studyMembers.findMany({
    where: and(
      eq(studyMembers.userId, userId),
      eq(studyMembers.isActive, true),
    ),
    with: {
      study: true,
    },
  });

  const result = await Promise.all(
    members.map(async member => {
      const allMembers = await db.query.studyMembers.findMany({
        where: eq(studyMembers.studyId, member.studyId),
      });

      const currentDay = getCurrentDayNumber(member.study.startDate);

      return {
        study: member.study,
        memberInfo: member,
        currentDay,
        memberCount: allMembers.length,
      };
    }),
  );

  return result;
}

/**
 * Get study by ID (alias for getStudy)
 */
export async function getStudyById(studyId: string): Promise<Study | null> {
  return getStudy(studyId);
}

/**
 * Get all members of a study with user information
 */
export async function getStudyMembers(studyId: string): Promise<StudyMember[]> {
  const members = await db.query.studyMembers.findMany({
    where: and(
      eq(studyMembers.studyId, studyId),
      eq(studyMembers.isActive, true),
    ),
    with: {
      user: true,
    },
  });

  return members;
}
