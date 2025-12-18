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

**Status**: ✅ Completed
**Priority**: Medium
**Estimated Complexity**: Medium
**Dependencies**: None (all required services exist)

---

## Comments on All Member Submissions

### Overview
Add commenting functionality to the "All Member Submissions" section on Day pages, allowing study members to provide feedback and engage in discussions on each other's submissions.

### Current State
- ✅ Members can view all submissions in "All Member Submissions" section
- ✅ Each submission shows member info, answers, and reflection
- ❌ No way to comment on other members' submissions
- ✅ Comments only work on user's own submission

### Goal
Enable collaborative learning by allowing members to comment on each other's Day submissions directly from the "All Member Submissions" section.

### Features

#### 1. Submission Card Enhancement
- **Comment Count Display**
  - Show comment count badge on each submission card
  - "👤 Username • 5 comments"
  - Visual indicator that feedback is available

#### 2. Expandable Submission Details
- **Two-state display**:
  - **Collapsed** (default): Member info + comment count
  - **Expanded**: Full submission + comments section
- Click to toggle between states

#### 3. Comments Section Integration
- **Reuse existing CommentsSection component**
  - Pass `submissionId` of the viewed member's submission
  - All members can read and write comments
  - Show comment author, timestamp, content
  - Edit/delete own comments

#### 4. UI/UX Improvements
- **Visual hierarchy**:
  - Submission cards with subtle borders
  - Expanded state with elevated shadow
  - Clear visual separation between submissions
- **Loading states**:
  - Lazy load comments when expanded
  - Show loading spinner while fetching
- **Performance**:
  - Only load comments for expanded submissions
  - Optimize re-renders

### Technical Implementation

#### Modified Files
1. `src/app/studies/[studyId]/day/[dayNumber]/page.tsx`
   - Add expand/collapse state for each submission
   - Load comments count for each submission
   - Integrate CommentsSection for each submission

#### Existing Components to Use
- `CommentsSection` - Already built, just need to pass different `submissionId`
- `Button` - For expand/collapse toggle

#### New State Management
```tsx
const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});
```

#### API Calls Needed
- Existing: `getCommentsAction(submissionId)` - Get comments for a submission
- New (optional): `getCommentCountAction(submissionId)` - Get comment count without loading all comments

### Implementation Steps

#### ✅ Step 1: Update Member Submission Card UI
- [x] Add comment count to member info header
- [x] Add expand/collapse button
- [x] Add state management for expanded submissions

#### ✅ Step 2: Implement Expand/Collapse Logic
- [x] Create toggle function for each submission
- [x] Show/hide submission details based on state
- [x] Add smooth transition animation

#### ✅ Step 3: Integrate Comments Section
- [x] Add CommentsSection component to expanded view
- [x] Pass correct submissionId to each CommentsSection
- [x] Test comment CRUD operations

#### ✅ Step 4: Add Comment Count Display
- [x] Load comment counts on page load
- [x] Display count in collapsed view
- [x] Update count after new comment added

#### ✅ Step 5: Polish & Optimize
- [x] Add loading states
- [x] Optimize comment loading (lazy load)
- [x] Improve visual design
- [x] Test responsive layout
- [x] Dark mode compatibility

#### ✅ Step 6: Test & Verify
- [x] Test with multiple members
- [x] Verify comment notifications work
- [x] Check permissions (all members can comment)
- [x] Build and deploy

### UI Design

```
┌─────────────────────────────────────────────┐
│ 👥 All Member Submissions (3/5)             │
│                                [View All ▼] │
├─────────────────────────────────────────────┤
│                                             │
│ Collapsed State:                            │
│ ┌─────────────────────────────────────┐    │
│ │ 👤 김철수 • 5 comments       [▼]   │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Expanded State:                             │
│ ┌─────────────────────────────────────┐    │
│ │ 👤 김철수 • 5 comments       [▲]   │    │
│ ├─────────────────────────────────────┤    │
│ │ Q1. What are the key concepts?      │    │
│ │ └─ Answer text here...              │    │
│ │                                     │    │
│ │ Q2. How can you apply this?         │    │
│ │ └─ Answer text here...              │    │
│ │                                     │    │
│ │ 📝 Daily Reflection                 │    │
│ │ └─ Reflection text here...          │    │
│ ├─────────────────────────────────────┤    │
│ │ 💬 Comments (5)                     │    │
│ │ ┌─────────────────────────────┐    │    │
│ │ │ [Comment input]             │    │    │
│ │ └─────────────────────────────┘    │    │
│ │                                     │    │
│ │ 👤 이영희 • 2 hours ago             │    │
│ │ Great insights on...                │    │
│ └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Benefits
1. **Enhanced Collaboration**: Members can discuss and learn from each other's answers
2. **Immediate Feedback**: Get feedback on submissions right away
3. **Motivation**: Seeing comments encourages participation
4. **Context**: Comments are tied to specific Day and topic
5. **Community Building**: Fosters sense of learning together

### Future Enhancements
- Comment threading (replies to comments)
- @mentions to notify specific members
- Like/reaction system for comments
- Filter comments by member
- Export discussion as study notes

---

**Status**: ✅ Completed
**Priority**: High
**Estimated Complexity**: Medium
**Dependencies**: Existing CommentsSection component
