import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Study, StudyMember, DayPlan, Assignment } from "@/types/study";

/**
 * Generate a random invite code
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new study
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
  ownerId: string
): Promise<{ studyId: string; inviteCode: string }> {
  try {
    const inviteCode = generateInviteCode();

    // Create study document
    const studyRef = doc(collection(db, "studies"));
    const studyId = studyRef.id;

    const study: Omit<Study, "studyId"> = {
      studyName: studyData.studyName,
      description: studyData.description || "", // Prevent undefined value
      bookTitle: studyData.bookTitle,
      inviteCode: inviteCode,
      startDate: Timestamp.fromDate(studyData.startDate) as any,
      endDate: Timestamp.fromDate(studyData.endDate) as any,
      ownerId: ownerId,
      status: "active",
      maxMembers: studyData.maxMembers,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };

    await setDoc(studyRef, study);

    // Add owner as first member
    const memberRef = doc(collection(db, "studyMembers"));
    const member: Omit<StudyMember, "memberId"> = {
      studyId: studyId,
      userId: ownerId,
      role: "owner",
      joinedAt: serverTimestamp() as any,
      isActive: true,
      progressRate: 0,
    };

    await setDoc(memberRef, member);

    // Create 15 day plans
    await create15DayPlans(studyId, studyData.bookTitle);

    return { studyId, inviteCode };
  } catch (error) {
    console.error("Error creating study:", error);
    throw error;
  }
}

/**
 * Create 15 day plans for a study
 */
async function create15DayPlans(studyId: string, bookTitle: string) {
  const dayPlans = [
    {
      dayNumber: 1,
      title: "Introduction to Stock Market",
      learningGoal: "Understand the basic concepts of stock market and investing",
      chapterInfo: "Chapter 1",
    },
    {
      dayNumber: 2,
      title: "Types of Stocks",
      learningGoal: "Learn about different types of stocks and their characteristics",
      chapterInfo: "Chapter 2",
    },
    {
      dayNumber: 3,
      title: "Reading Stock Charts",
      learningGoal: "Master the basics of reading and interpreting stock charts",
      chapterInfo: "Chapter 3",
    },
    {
      dayNumber: 4,
      title: "Market Analysis Fundamentals",
      learningGoal: "Learn fundamental analysis techniques",
      chapterInfo: "Chapter 4",
    },
    {
      dayNumber: 5,
      title: "Financial Statements Analysis",
      learningGoal: "Understand balance sheets, income statements, and cash flow",
      chapterInfo: "Chapter 5",
    },
    {
      dayNumber: 6,
      title: "Technical Indicators",
      learningGoal: "Learn about key technical indicators and their usage",
      chapterInfo: "Chapter 6",
    },
    {
      dayNumber: 7,
      title: "Risk Management",
      learningGoal: "Understand risk management strategies in stock investing",
      chapterInfo: "Chapter 7",
    },
    {
      dayNumber: 8,
      title: "Portfolio Diversification",
      learningGoal: "Learn how to build a diversified investment portfolio",
      chapterInfo: "Chapter 8",
    },
    {
      dayNumber: 9,
      title: "Market Trends and Cycles",
      learningGoal: "Understand market cycles and trend analysis",
      chapterInfo: "Chapter 9",
    },
    {
      dayNumber: 10,
      title: "Investment Strategies",
      learningGoal: "Explore different investment strategies and when to use them",
      chapterInfo: "Chapter 10",
    },
    {
      dayNumber: 11,
      title: "Trading Psychology",
      learningGoal: "Learn about emotional control and trading discipline",
      chapterInfo: "Chapter 11",
    },
    {
      dayNumber: 12,
      title: "Value Investing",
      learningGoal: "Understand value investing principles and techniques",
      chapterInfo: "Chapter 12",
    },
    {
      dayNumber: 13,
      title: "Growth Investing",
      learningGoal: "Learn about growth stock identification and analysis",
      chapterInfo: "Chapter 13",
    },
    {
      dayNumber: 14,
      title: "Market News and Information",
      learningGoal: "Learn how to interpret market news and use information effectively",
      chapterInfo: "Chapter 14",
    },
    {
      dayNumber: 15,
      title: "Building Your Investment Plan",
      learningGoal: "Create a personalized investment plan and strategy",
      chapterInfo: "Chapter 15",
    },
  ];

  for (const plan of dayPlans) {
    const planRef = doc(collection(db, "dayPlans"));
    const dayPlan: Omit<DayPlan, "planId"> = {
      studyId: studyId,
      dayNumber: plan.dayNumber,
      title: plan.title,
      learningGoal: plan.learningGoal,
      chapterInfo: plan.chapterInfo,
      description: `Day ${plan.dayNumber}: ${plan.title}`,
    };

    await setDoc(planRef, dayPlan);

    // Create sample assignments for each day
    await createAssignmentsForDay(planRef.id, plan.dayNumber);
  }
}

/**
 * Create assignments for a day plan
 */
async function createAssignmentsForDay(planId: string, dayNumber: number) {
  const assignments = [
    {
      questionText: `What are the key concepts you learned today?`,
      questionOrder: 1,
      isRequired: true,
    },
    {
      questionText: `How can you apply today's learning to your investment strategy?`,
      questionOrder: 2,
      isRequired: true,
    },
    {
      questionText: `What questions or uncertainties do you still have?`,
      questionOrder: 3,
      isRequired: false,
    },
  ];

  for (const assignment of assignments) {
    const assignmentRef = doc(collection(db, "assignments"));
    const assignmentData: Omit<Assignment, "assignmentId"> = {
      planId: planId,
      questionText: assignment.questionText,
      questionOrder: assignment.questionOrder,
      isRequired: assignment.isRequired,
    };

    await setDoc(assignmentRef, assignmentData);
  }
}

/**
 * Join a study using invite code
 */
export async function joinStudy(
  inviteCode: string,
  userId: string
): Promise<string> {
  try {
    // Find study by invite code
    const studiesRef = collection(db, "studies");
    const q = query(studiesRef, where("inviteCode", "==", inviteCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Invalid invite code");
    }

    const studyDoc = querySnapshot.docs[0];
    const studyId = studyDoc.id;
    const studyData = studyDoc.data() as Study;

    // Check if user is already a member
    const membersRef = collection(db, "studyMembers");
    const memberQuery = query(
      membersRef,
      where("studyId", "==", studyId),
      where("userId", "==", userId)
    );
    const memberSnapshot = await getDocs(memberQuery);

    if (!memberSnapshot.empty) {
      throw new Error("You are already a member of this study");
    }

    // Check if study is full
    const allMembersQuery = query(membersRef, where("studyId", "==", studyId));
    const allMembersSnapshot = await getDocs(allMembersQuery);

    if (allMembersSnapshot.size >= studyData.maxMembers) {
      throw new Error("This study has reached its maximum capacity");
    }

    // Add user as member
    const newMemberRef = doc(collection(db, "studyMembers"));
    const member: Omit<StudyMember, "memberId"> = {
      studyId: studyId,
      userId: userId,
      role: "member",
      joinedAt: serverTimestamp() as any,
      isActive: true,
      progressRate: 0,
    };

    await setDoc(newMemberRef, member);

    return studyId;
  } catch (error) {
    console.error("Error joining study:", error);
    throw error;
  }
}

/**
 * Get user's studies
 */
export async function getUserStudies(userId: string): Promise<Study[]> {
  try {
    // Get all study memberships for user
    const membersRef = collection(db, "studyMembers");
    const q = query(
      membersRef,
      where("userId", "==", userId),
      where("isActive", "==", true)
    );
    const memberSnapshot = await getDocs(q);

    const studies: Study[] = [];

    for (const memberDoc of memberSnapshot.docs) {
      const memberData = memberDoc.data() as StudyMember;
      const studyRef = doc(db, "studies", memberData.studyId);
      const studyDoc = await getDoc(studyRef);

      if (studyDoc.exists()) {
        const studyData = studyDoc.data();
        studies.push({
          studyId: studyDoc.id,
          studyName: studyData.studyName,
          description: studyData.description,
          bookTitle: studyData.bookTitle,
          inviteCode: studyData.inviteCode,
          startDate: studyData.startDate?.toDate() || new Date(),
          endDate: studyData.endDate?.toDate() || new Date(),
          ownerId: studyData.ownerId,
          status: studyData.status,
          maxMembers: studyData.maxMembers,
          createdAt: studyData.createdAt?.toDate() || new Date(),
          updatedAt: studyData.updatedAt?.toDate() || new Date(),
        });
      }
    }

    return studies;
  } catch (error) {
    console.error("Error getting user studies:", error);
    throw error;
  }
}

/**
 * Get study details
 */
export async function getStudy(studyId: string): Promise<Study | null> {
  try {
    const studyRef = doc(db, "studies", studyId);
    const studyDoc = await getDoc(studyRef);

    if (!studyDoc.exists()) {
      return null;
    }

    const studyData = studyDoc.data();
    return {
      studyId: studyDoc.id,
      studyName: studyData.studyName,
      description: studyData.description,
      bookTitle: studyData.bookTitle,
      inviteCode: studyData.inviteCode,
      startDate: studyData.startDate?.toDate() || new Date(),
      endDate: studyData.endDate?.toDate() || new Date(),
      ownerId: studyData.ownerId,
      status: studyData.status,
      maxMembers: studyData.maxMembers,
      createdAt: studyData.createdAt?.toDate() || new Date(),
      updatedAt: studyData.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error getting study:", error);
    throw error;
  }
}

/**
 * Get day plans for a study
 */
export async function getDayPlans(studyId: string): Promise<DayPlan[]> {
  try {
    const plansRef = collection(db, "dayPlans");
    const q = query(plansRef, where("studyId", "==", studyId));
    const querySnapshot = await getDocs(q);

    const dayPlans: DayPlan[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      dayPlans.push({
        planId: doc.id,
        studyId: data.studyId,
        dayNumber: data.dayNumber,
        title: data.title,
        learningGoal: data.learningGoal,
        chapterInfo: data.chapterInfo,
        description: data.description,
        targetDate: data.targetDate?.toDate(),
      });
    });

    // Sort by day number
    dayPlans.sort((a, b) => a.dayNumber - b.dayNumber);

    return dayPlans;
  } catch (error) {
    console.error("Error getting day plans:", error);
    throw error;
  }
}

/**
 * Get assignments for a day plan
 */
export async function getAssignments(planId: string): Promise<Assignment[]> {
  try {
    const assignmentsRef = collection(db, "assignments");
    const q = query(assignmentsRef, where("planId", "==", planId));
    const querySnapshot = await getDocs(q);

    const assignments: Assignment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      assignments.push({
        assignmentId: doc.id,
        planId: data.planId,
        questionText: data.questionText,
        questionOrder: data.questionOrder,
        isRequired: data.isRequired,
      });
    });

    // Sort by question order
    assignments.sort((a, b) => a.questionOrder - b.questionOrder);

    return assignments;
  } catch (error) {
    console.error("Error getting assignments:", error);
    throw error;
  }
}

/**
 * Get user's study member info for a specific study
 */
export async function getUserStudyMember(
  userId: string,
  studyId: string
): Promise<StudyMember | null> {
  try {
    const membersRef = collection(db, "studyMembers");
    const q = query(
      membersRef,
      where("userId", "==", userId),
      where("studyId", "==", studyId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      memberId: doc.id,
      studyId: data.studyId,
      userId: data.userId,
      role: data.role,
      joinedAt: data.joinedAt?.toDate() || new Date(),
      isActive: data.isActive,
      progressRate: data.progressRate || 0,
    };
  } catch (error) {
    console.error("Error getting user study member:", error);
    throw error;
  }
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
  studyId: string
): Promise<{ study: Study; memberCount: number } | null> {
  try {
    const study = await getStudy(studyId);
    if (!study) {
      return null;
    }

    const membersRef = collection(db, "studyMembers");
    const q = query(membersRef, where("studyId", "==", studyId));
    const querySnapshot = await getDocs(q);

    return {
      study,
      memberCount: querySnapshot.size,
    };
  } catch (error) {
    console.error("Error getting study with member count:", error);
    throw error;
  }
}

/**
 * Get user's studies with progress info
 */
export async function getUserStudiesWithProgress(
  userId: string
): Promise<
  Array<{
    study: Study;
    memberInfo: StudyMember;
    currentDay: number;
    memberCount: number;
  }>
> {
  try {
    const membersRef = collection(db, "studyMembers");
    const q = query(
      membersRef,
      where("userId", "==", userId),
      where("isActive", "==", true)
    );
    const memberSnapshot = await getDocs(q);

    // Parallelize all study and member count queries
    const studiesWithProgress = await Promise.all(
      memberSnapshot.docs.map(async (memberDoc) => {
        const memberData = memberDoc.data();

        // Get study and member count in parallel
        const [studyDoc, allMembersSnapshot] = await Promise.all([
          getDoc(doc(db, "studies", memberData.studyId)),
          getDocs(
            query(membersRef, where("studyId", "==", memberData.studyId))
          ),
        ]);

        if (!studyDoc.exists()) {
          return null;
        }

        const studyData = studyDoc.data();
        const study: Study = {
          studyId: studyDoc.id,
          studyName: studyData.studyName,
          description: studyData.description,
          bookTitle: studyData.bookTitle,
          inviteCode: studyData.inviteCode,
          startDate: studyData.startDate?.toDate() || new Date(),
          endDate: studyData.endDate?.toDate() || new Date(),
          ownerId: studyData.ownerId,
          status: studyData.status,
          maxMembers: studyData.maxMembers,
          createdAt: studyData.createdAt?.toDate() || new Date(),
          updatedAt: studyData.updatedAt?.toDate() || new Date(),
        };

        // Calculate current day
        const currentDay = getCurrentDayNumber(study.startDate);

        return {
          study,
          memberInfo: {
            memberId: memberDoc.id,
            studyId: memberData.studyId,
            userId: memberData.userId,
            role: memberData.role,
            joinedAt: memberData.joinedAt?.toDate?.() || new Date(),
            isActive: memberData.isActive,
            progressRate: memberData.progressRate || 0,
          },
          currentDay,
          memberCount: allMembersSnapshot.size,
        };
      })
    );

    // Filter out null results
    return studiesWithProgress.filter((item) => item !== null) as Array<{
      study: Study;
      memberInfo: StudyMember;
      currentDay: number;
      memberCount: number;
    }>;
  } catch (error) {
    console.error("Error getting user studies with progress:", error);
    throw error;
  }
}

/**
 * Get study by ID
 */
export async function getStudyById(studyId: string): Promise<Study | null> {
  try {
    const studyRef = doc(db, "studies", studyId);
    const studyDoc = await getDoc(studyRef);

    if (!studyDoc.exists()) {
      return null;
    }

    const data = studyDoc.data();
    return {
      studyId: studyDoc.id,
      studyName: data.studyName,
      description: data.description,
      bookTitle: data.bookTitle,
      inviteCode: data.inviteCode,
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || new Date(),
      ownerId: data.ownerId,
      status: data.status,
      maxMembers: data.maxMembers,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error getting study by ID:", error);
    throw error;
  }
}

/**
 * Get all members of a study with user information
 */
export async function getStudyMembers(studyId: string): Promise<StudyMember[]> {
  try {
    const membersRef = collection(db, "studyMembers");
    const q = query(
      membersRef,
      where("studyId", "==", studyId),
      where("isActive", "==", true)
    );
    const querySnapshot = await getDocs(q);

    const members: StudyMember[] = [];

    for (const memberDoc of querySnapshot.docs) {
      const data = memberDoc.data();

      // Get user data
      const userRef = doc(db, "users", data.userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : null;

      members.push({
        memberId: memberDoc.id,
        studyId: data.studyId,
        userId: data.userId,
        role: data.role,
        joinedAt: data.joinedAt?.toDate?.() || new Date(),
        isActive: data.isActive,
        progressRate: data.progressRate || 0,
        user: userData
          ? {
              uid: data.userId,
              username: userData.username,
              email: userData.email,
              createdAt: userData.createdAt?.toDate() || new Date(),
              photoURL: userData.photoURL,
              lastLoginAt: userData.lastLoginAt?.toDate(),
            }
          : undefined,
      });
    }

    return members;
  } catch (error) {
    console.error("Error getting study members:", error);
    throw error;
  }
}
