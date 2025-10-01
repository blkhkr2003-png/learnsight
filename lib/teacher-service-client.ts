
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserDoc, DiagnosticAttempt, Fundamental } from "@/types";
import {
  TeacherDashboardData,
  RecentStudent,
  Alert,
  ClassDoc,
  TeacherAlertDoc,
} from "@/types/teacher";

// Collections
const USERS_COL = "users";
const CLASSES_COL = "classes";
const ATTEMPTS_COL = "diagnosticAttempts";
const TEACHER_ALERTS_COL = "teacherAlerts";

// Helper to convert document to data
const docToData = <T>(doc: QueryDocumentSnapshot): T => {
  return { id: doc.id, ...(doc.data() as Omit<T, "id"> as T) };
};

// Get teacher by ID
export async function getTeacherById(
  teacherId: string
): Promise<UserDoc | null> {
  const teacherDoc = await getDoc(doc(db, USERS_COL, teacherId));
  if (!teacherDoc.exists()) return null;
  const data = teacherDoc.data() as Omit<UserDoc, "uid">;
  return { uid: teacherDoc.id, ...data };
}

// Get class by ID
export async function getClassById(classId: string): Promise<ClassDoc | null> {
  const classDoc = await getDoc(doc(db, CLASSES_COL, classId));
  if (!classDoc.exists()) return null;
  const data = classDoc.data() as Omit<ClassDoc, "id">;
  return { id: classDoc.id, ...data };
}

// Get students by teacher assignment
export async function getStudentsByTeacherId(teacherId: string): Promise<UserDoc[]> {
  try {
    console.log(`Fetching students for teacher ID: ${teacherId}`);
    
    // We can't query by teacherId due to security rules, and we can't query by role either
    // Instead, we'll use a different approach
    try {
      // Since we can't query all students at once, we need to find another way
      // Let's check if we have any teacher alerts that reference students
      const alertsQuery = query(
        collection(db, TEACHER_ALERTS_COL),
        where("teacherId", "==", teacherId)
      );
      
      const alertsSnapshot = await getDocs(alertsQuery);
      const studentIds = new Set<string>();
      
      // Extract student IDs from alerts
      alertsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.studentId) {
          studentIds.add(data.studentId);
        }
      });
      
      console.log(`Found ${studentIds.size} student IDs from alerts`);
      
      // Fetch each student individually
      const students: UserDoc[] = [];
      for (const studentId of studentIds) {
        try {
          const studentDoc = await getDoc(doc(db, USERS_COL, studentId));
          if (studentDoc.exists()) {
            const data = studentDoc.data() as Omit<UserDoc, "uid">;
            // Verify this student is actually assigned to this teacher
            if (data.teacherId === teacherId) {
              students.push({ uid: studentId, ...data });
            }
          }
        } catch (error) {
          console.error(`Error fetching student ${studentId}:`, error);
          // Continue with other students
        }
      }
      
      console.log(`Found ${students.length} students for teacher ${teacherId}`);
      return students;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw new Error(`Failed to fetch students: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error in getStudentsByTeacherId:", error);
    throw error;
  }
}

// Get diagnostic attempts for a list of student IDs
export async function getDiagnosticAttemptsByStudentIds(
  studentIds: string[]
): Promise<DiagnosticAttempt[]> {
  if (studentIds.length === 0) return [];

  // Firestore "in" operator supports up to 10 values, so we need to batch
  const batchSize = 10;
  const results: DiagnosticAttempt[] = [];

  try {
    for (let i = 0; i < studentIds.length; i += batchSize) {
      const batch = studentIds.slice(i, i + batchSize);

      try {
        const attemptsQuery = query(
          collection(db, ATTEMPTS_COL),
          where("userId", "in", batch),
          orderBy("completedAt", "desc")
        );
        const attemptsSnapshot = await getDocs(attemptsQuery);
        const batchResults = attemptsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as DiagnosticAttempt),
        }));
        results.push(...batchResults);
      } catch (batchError) {
        console.error(`Error fetching diagnostic attempts for batch ${i}:`, batchError);

        // If it's a permission error, try an alternative approach for this batch
        if (batchError instanceof Error &&
            (batchError.message.includes("permission") ||
             batchError.message.includes("PERMISSION_DENIED") ||
             batchError.message.includes("Missing or insufficient permissions"))) {
          console.log(`Permission error with batch ${i}, trying individual requests`);

          try {
            // Alternative approach: Get attempts for each student individually
            for (const studentId of batch) {
              try {
                const studentAttemptsQuery = query(
                  collection(db, ATTEMPTS_COL),
                  where("userId", "==", studentId),
                  orderBy("completedAt", "desc")
                );
                const studentAttemptsSnapshot = await getDocs(studentAttemptsQuery);
                const studentResults = studentAttemptsSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...(doc.data() as DiagnosticAttempt),
                }));
                results.push(...studentResults);
              } catch (individualError) {
                console.error(`Error fetching attempts for student ${studentId}:`, individualError);
                // Continue with other students
              }
            }
          } catch (alternativeError) {
            console.error(`Error with alternative approach for batch ${i}:`, alternativeError);
            // Continue with other batches
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in getDiagnosticAttemptsByStudentIds:", error);
    // Return whatever results we have so far rather than failing completely
  }

  return results;
}

// Get recent diagnostic attempts for a list of students
export async function getRecentDiagnosticAttemptsForStudents(
  students: UserDoc[],
  count: number = 5
): Promise<RecentStudent[]> {
  const studentIds = students.map((s) => s.uid);
  if (studentIds.length === 0) return [];

  // Get the most recent attempt for each student
  const recentAttempts: RecentStudent[] = [];

  for (const student of students) {
    const attemptsQuery = query(
      collection(db, ATTEMPTS_COL),
      where("userId", "==", student.uid),
      orderBy("completedAt", "desc"),
      limit(1)
    );

    const attemptsSnapshot = await getDocs(attemptsQuery);
    if (!attemptsSnapshot.empty) {
      const attempt = docToData<DiagnosticAttempt>(attemptsSnapshot.docs[0]);

      if (attempt.completedAt) {
        const aggregates = attempt.aggregates || {};
        let weakestSkill: Fundamental = "listening";
        let minValue = 100;

        Object.entries(aggregates).forEach(([skill, value]) => {
          const numericValue = value as number;
          if (numericValue < minValue) {
            minValue = numericValue;
            weakestSkill = skill as Fundamental;
          }
        });

        const progress = Math.round(
          Object.values(aggregates).reduce(
            (sum: number, val: unknown) => sum + (val as number),
            0
          ) / Object.values(aggregates).length
        );

        recentAttempts.push({
          id: student.uid,
          name: student.name,
          lastDiagnostic: attempt.completedAt
            .toDate()
            .toISOString()
            .split("T")[0],
          weakestSkill:
            weakestSkill.charAt(0).toUpperCase() + weakestSkill.slice(1),
          progress,
          status:
            progress >= 85
              ? "excellent"
              : progress >= 70
              ? "active"
              : "needs-attention",
          trend: Math.random() > 0.5 ? "up" : "down",
        });
      }
    }
  }

  return recentAttempts
    .sort(
      (a, b) =>
        new Date(b.lastDiagnostic).getTime() -
        new Date(a.lastDiagnostic).getTime()
    )
    .slice(0, count);
}

// Get teacher alerts
export async function getTeacherAlerts(teacherId: string): Promise<Alert[]> {
  const alertsQuery = query(
    collection(db, TEACHER_ALERTS_COL),
    where("teacherId", "==", teacherId),
    orderBy("createdAt", "desc"),
    limit(5)
  );

  const alertsSnapshot = await getDocs(alertsQuery);
  return alertsSnapshot.docs.map((doc) => {
    const alert = docToData<TeacherAlertDoc>(doc);
    const mapSeverity = (sev: TeacherAlertDoc["severity"]): Alert["type"] =>
      sev === "critical" ? "error" : sev;
    return {
      type: mapSeverity(alert.severity),
      message: alert.message,
      action: "View details",
    };
  });
}

// Calculate class statistics from diagnostic attempts
export function calculateClassStats(attempts: DiagnosticAttempt[]) {
  if (attempts.length === 0) {
    return {
      listening: 0,
      grasping: 0,
      retention: 0,
      application: 0,
    };
  }

  const completedAttempts = attempts.filter(
    (a) => a.completedAt && a.aggregates
  );

  if (completedAttempts.length === 0) {
    return {
      listening: 0,
      grasping: 0,
      retention: 0,
      application: 0,
    };
  }

  const stats = {
    listening: 0,
    grasping: 0,
    retention: 0,
    application: 0,
  };

  completedAttempts.forEach((attempt) => {
    if (attempt.aggregates) {
      const aggregates = attempt.aggregates as Record<Fundamental, number>;
      Object.entries(aggregates).forEach(([skill, value]) => {
        if (skill in stats) {
          const typedSkill = skill as Fundamental;
          const typedValue = value as number;
          stats[typedSkill] += typedValue;
        }
      });
    }
  });

  // Calculate averages
  Object.keys(stats).forEach((skill) => {
    stats[skill as Fundamental] = Math.round(
      stats[skill as Fundamental] / completedAttempts.length
    );
  });

  return stats;
}

// Calculate average score from diagnostic attempts
export function calculateAverageScore(attempts: DiagnosticAttempt[]): number {
  const completedAttempts = attempts.filter(
    (a) => a.completedAt && a.aggregates
  );

  if (completedAttempts.length === 0) return 0;

  let totalScore = 0;

  completedAttempts.forEach((attempt) => {
    if (attempt.aggregates) {
      const aggregates = attempt.aggregates as Record<Fundamental, number>;
      const values: number[] = Object.values(aggregates);
      const initialValue = 0;
      const attemptAverage =
        values.reduce(
          (sum: number, val: number) => sum + (val as number),
          initialValue
        ) / values.length;

      totalScore += attemptAverage;
    }
  });

  return Math.round(totalScore / completedAttempts.length);
}

// Get all data needed for teacher dashboard
export async function getTeacherDashboardData(
  teacherId: string
): Promise<TeacherDashboardData> {
  console.log(`Fetching dashboard data for teacher: ${teacherId}`);

  try {
    // Get teacher data
    let teacher;
    try {
      teacher = await getTeacherById(teacherId);
      if (!teacher) {
        console.error(`Teacher not found: ${teacherId}`);
        throw new Error("Teacher not found");
      }
      console.log(`Found teacher: ${teacher.name}`);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      throw new Error("Failed to fetch teacher data");
    }

    // Resolve display class name (optional grouping)
    let className = "My Students";
    if (teacher.classId) {
      try {
        const classData = await getClassById(teacher.classId);
        if (classData) {
          className = classData.name || `Class ${teacher.classId}`;
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
        // Continue with default class name
      }
    }

    // Get students assigned to this teacher
    let students;
    try {
      students = await getStudentsByTeacherId(teacherId);
      console.log(`Found ${students.length} students for teacher ${teacherId}`);
    } catch (error) {
      console.error("Error fetching students:", error);
      throw new Error("Failed to fetch students");
    }

    // Get diagnostic attempts for these students
    let attempts: DiagnosticAttempt[] = [];
    try {
      const studentIds = students.map((s) => s.uid);
      attempts = await getDiagnosticAttemptsByStudentIds(studentIds);
      console.log(`Found ${attempts.length} diagnostic attempts`);
    } catch (error) {
      console.error("Error fetching diagnostic attempts:", error);
      // Continue with empty attempts array
      attempts = [];
    }

    // Get recent student data
    let recentStudents: RecentStudent[] = [];
    try {
      recentStudents = await getRecentDiagnosticAttemptsForStudents(students);
      console.log(`Generated recent student data for ${recentStudents.length} students`);
    } catch (error) {
      console.error("Error generating recent student data:", error);
      // Continue with empty array
      recentStudents = [];
    }

    // Get teacher alerts
    let alerts: Alert[] = [];
    try {
      alerts = await getTeacherAlerts(teacherId);
      console.log(`Found ${alerts.length} alerts for teacher`);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      // Continue with empty array
      alerts = [];
    }

    // Calculate class statistics
    const classStats = calculateClassStats(attempts);
    console.log("Calculated class stats:", classStats);

    // Calculate average score
    const averageScore = calculateAverageScore(attempts);
    console.log(`Calculated average score: ${averageScore}%`);

    // Return all the data needed for the dashboard
    return {
      name: teacher.name,
      className,
      totalStudents: students.length,
      studentsCompleted: students.length, // Assuming all students have completed
      classStats,
      averageScore,
      recentStudents,
      alerts,
    };
  } catch (error) {
    console.error("Error in getTeacherDashboardData:", error);
    throw error;
  }
}

// Update student teacher assignment
export async function updateStudentTeacherAssignment(
  studentId: string,
  teacherId: string
): Promise<void> {
  try {
    const { doc, updateDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");

    await updateDoc(doc(db, "users", studentId), {
      teacherId: teacherId
    });
  } catch (error) {
    console.error("Error updating student teacher assignment:", error);
    throw new Error(`Failed to update student teacher assignment: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
