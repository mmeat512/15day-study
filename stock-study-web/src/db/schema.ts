import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const studyStatusEnum = pgEnum('study_status', [
  'active',
  'completed',
  'archived',
]);

export const memberRoleEnum = pgEnum('member_role', ['owner', 'member']);

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  photoURL: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

// Studies table
export const studies = pgTable('studies', {
  id: text('id').primaryKey(),
  studyName: varchar('study_name', { length: 100 }).notNull(),
  description: text('description'),
  bookTitle: varchar('book_title', { length: 200 }),
  inviteCode: varchar('invite_code', { length: 20 }).notNull().unique(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: studyStatusEnum('status').default('active').notNull(),
  maxMembers: integer('max_members').default(10).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// StudyMembers table
export const studyMembers = pgTable('study_members', {
  id: text('id').primaryKey(),
  studyId: text('study_id')
    .notNull()
    .references(() => studies.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: memberRoleEnum('role').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  progressRate: integer('progress_rate').default(0).notNull(),
});

// DayPlans table
export const dayPlans = pgTable('day_plans', {
  id: text('id').primaryKey(),
  studyId: text('study_id')
    .notNull()
    .references(() => studies.id, { onDelete: 'cascade' }),
  dayNumber: integer('day_number').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  learningGoal: text('learning_goal'),
  chapterInfo: varchar('chapter_info', { length: 100 }),
  description: text('description'),
  targetDate: timestamp('target_date').notNull(),
});

// Assignments table
export const assignments = pgTable('assignments', {
  id: text('id').primaryKey(),
  planId: text('plan_id')
    .notNull()
    .references(() => dayPlans.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  questionOrder: integer('question_order').notNull(),
  isRequired: boolean('is_required').default(true).notNull(),
});

// Submissions table
export const submissions = pgTable('submissions', {
  id: text('id').primaryKey(),
  planId: text('plan_id')
    .notNull()
    .references(() => dayPlans.id, { onDelete: 'cascade' }),
  studyId: text('study_id')
    .notNull()
    .references(() => studies.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  dayNumber: integer('day_number').notNull(),
  answers: jsonb('answers').notNull(),
  reflection: text('reflection'),
  isCompleted: boolean('is_completed').default(false).notNull(),
  submittedAt: timestamp('submitted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Comments table
export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id')
    .notNull()
    .references(() => submissions.id, { onDelete: 'cascade' }),
  studyId: text('study_id')
    .notNull()
    .references(() => studies.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedStudies: many(studies),
  studyMemberships: many(studyMembers),
  submissions: many(submissions),
  comments: many(comments),
}));

export const studiesRelations = relations(studies, ({ one, many }) => ({
  owner: one(users, {
    fields: [studies.ownerId],
    references: [users.id],
  }),
  members: many(studyMembers),
  dayPlans: many(dayPlans),
  submissions: many(submissions),
  comments: many(comments),
}));

export const studyMembersRelations = relations(studyMembers, ({ one }) => ({
  study: one(studies, {
    fields: [studyMembers.studyId],
    references: [studies.id],
  }),
  user: one(users, {
    fields: [studyMembers.userId],
    references: [users.id],
  }),
}));

export const dayPlansRelations = relations(dayPlans, ({ one, many }) => ({
  study: one(studies, {
    fields: [dayPlans.studyId],
    references: [studies.id],
  }),
  assignments: many(assignments),
  submissions: many(submissions),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  dayPlan: one(dayPlans, {
    fields: [assignments.planId],
    references: [dayPlans.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  dayPlan: one(dayPlans, {
    fields: [submissions.planId],
    references: [dayPlans.id],
  }),
  study: one(studies, {
    fields: [submissions.studyId],
    references: [studies.id],
  }),
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  submission: one(submissions, {
    fields: [comments.submissionId],
    references: [submissions.id],
  }),
  study: one(studies, {
    fields: [comments.studyId],
    references: [studies.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Study = typeof studies.$inferSelect;
export type NewStudy = typeof studies.$inferInsert;

export type StudyMember = typeof studyMembers.$inferSelect;
export type NewStudyMember = typeof studyMembers.$inferInsert;

export type DayPlan = typeof dayPlans.$inferSelect;
export type NewDayPlan = typeof dayPlans.$inferInsert;

export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
