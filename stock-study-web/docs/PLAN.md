# Feature Implementation Plan

## Member Profile Page

### Overview
A dedicated page to view a specific study member's complete learning progress and submission history within a study.

### Route
- Path: `/studies/[studyId]/members/[userId]`
- Dynamic route with study ID and user ID parameters

### Features

#### 1. Member Information Section
- **Profile Header**
  - Member username and avatar
  - Role (owner/member)
  - Join date
  - Overall progress rate (%)
  - Total completed days

#### 2. Progress Overview
- **Visual Progress Indicator**
  - Progress bar showing completion percentage
  - "X / 15 Days Completed" counter
  - Calendar view showing completed vs incomplete days

#### 3. Submission Timeline
- **Chronological List of All Submissions**
  - Day number and title
  - Submission status (completed/not submitted)
  - Submission date and time
  - Quick preview of answers (truncated)
  - Link to full submission details

#### 4. Day Submission Details
- For each completed day:
  - All assignment questions and answers
  - Daily reflection
  - Submission timestamp
  - Comments on that submission (if any)

#### 5. Statistics Card
- Total study days: 15
- Completed: X days
- Remaining: Y days
- Average submission time (if trackable)
- Streak information (consecutive days completed)

### Technical Implementation

#### New Files to Create
1. `src/app/studies/[studyId]/members/[userId]/page.tsx` - Main member profile page
2. `src/components/study/MemberProgressCard.tsx` - Member progress overview component
3. `src/components/study/SubmissionTimelineItem.tsx` - Individual submission timeline item

#### Existing Services to Use
- `getUserSubmissions(studyId, userId)` - Get all user submissions in a study
- `getUserStudyMember(userId, studyId)` - Get member info
- `getDayPlans(studyId)` - Get all 15 day plans to cross-reference

#### New Services (if needed)
- None - existing services should cover all data needs

#### Server Actions
- Use existing `getUserSubmissionsAction`
- Use existing `getUserStudyMemberAction`
- Use existing `getDayPlansAction`

### UI/UX Considerations

#### Navigation
- Add link to member profile from:
  - Study detail page member list
  - All submissions section (click on member name/avatar)
  - Comments section (click on commenter name)

#### Permissions
- All study members can view other members' profiles
- Privacy: All submissions are visible to study members (encourage learning together)
- Option to add privacy settings in future (toggle profile visibility)

#### Responsive Design
- Mobile: Stack cards vertically
- Desktop: Two-column layout for better space utilization

#### Loading States
- Skeleton loaders for submission timeline
- Progressive loading for large submission histories

### Implementation Steps

1. **Create Route and Page Component**
   - Set up dynamic route structure
   - Create basic page layout with header

2. **Implement Member Info Section**
   - Fetch and display member data
   - Show profile header with stats

3. **Build Progress Overview**
   - Create progress bar component
   - Implement day completion calendar/grid

4. **Create Submission Timeline**
   - List all days (1-15)
   - Mark completed vs incomplete
   - Show submission previews

5. **Add Day Detail Expansion**
   - Click to expand each day's full submission
   - Display all Q&A and reflection
   - Show timestamp and edit history

6. **Integrate Navigation**
   - Add links from member lists
   - Add links from submission sections
   - Implement back navigation

7. **Polish & Optimize**
   - Add loading states
   - Error handling
   - Responsive design
   - Dark mode support

### Future Enhancements
- Export member progress as PDF
- Direct message/feedback to member
- Comparison view (compare progress with other members)
- Achievement badges for milestones
- Personal notes on member submissions (for study owner)

---

**Status**: Planned (Not yet implemented)
**Priority**: Medium
**Estimated Complexity**: Medium
**Dependencies**: None (all required services exist)
