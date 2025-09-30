import { db } from "@/lib/firebase";
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
  const studentsQuery = query(
    collection(db, USERS_COL),
    where("role", "==", "student"),
    where("teacherId", "==", teacherId)
  );
  const studentsSnapshot = await getDocs(studentsQuery);
  return studentsSnapshot.docs.map((doc) => {
    const data = doc.data() as Omit<UserDoc, "uid">;
    return { uid: doc.id, ...data };
  });
}

// Get diagnostic attempts for a list of student IDs
export async function getDiagnosticAttemptsByStudentIds(
  studentIds: string[]
): Promise<DiagnosticAttempt[]> {
  if (studentIds.length === 0) return [];

  // Firestore "in" operator supports up to 10 values, so we need to batch
  const batchSize = 10;
  const results: DiagnosticAttempt[] = [];

  for (let i = 0; i < studentIds.length; i += batchSize) {
    const batch = studentIds.slice(i, i + batchSize);
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
  // Get teacher data
  const teacher = await getTeacherById(teacherId);
  if (!teacher) {
    throw new Error("Teacher not found");
  }

  // Resolve display class name (optional grouping)
  let className = "My Students";
  if (teacher.classId) {
    const classData = await getClassById(teacher.classId);
    if (classData) {
      className = classData.name || `Class ${teacher.classId}`;
    }
  }

  // Get students assigned to this teacher
  const students = await getStudentsByTeacherId(teacherId);

  // Get diagnostic attempts for these students
  const attempts = await getDiagnosticAttemptsByStudentIds(
    students.map((s) => s.uid)
  );

  // Calculate statistics
  const classStats = calculateClassStats(attempts);
  const averageScore = calculateAverageScore(attempts);

  // Get recent student activity
  const recentStudents = await getRecentDiagnosticAttemptsForStudents(students, 5);

  // Get teacher alerts
  const alerts = await getTeacherAlerts(teacherId);

  // Count students who have completed diagnostics
  const studentsWithAttempts = new Set(
    attempts.filter((a) => a.completedAt).map((a) => a.userId)
  ).size;

  return {
    name: teacher.name,
    className,
    totalStudents: students.length,
    studentsCompleted: studentsWithAttempts,
    averageScore,
    classStats,
    recentStudents,
    alerts: alerts.map((alert) => ({
      type: alert.type || "info",
      message: alert.message,
      action: alert.action || "View details",
    })),
  };
}
