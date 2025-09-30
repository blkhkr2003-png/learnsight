// types/teacher.ts
import { Fundamental } from "./index";

export interface TeacherDashboardData {
  name: string;
  className: string;
  totalStudents: number;
  studentsCompleted: number;
  averageScore: number;
  classStats: {
    listening: number;
    grasping: number;
    retention: number;
    application: number;
  };
  recentStudents: RecentStudent[];
  alerts: Alert[];
}

export interface RecentStudent {
  id: string;
  name: string;
  lastDiagnostic: string;
  weakestSkill: string;
  progress: number;
  trend: "up" | "down";
  status: "excellent" | "active" | "needs-attention";
}

export interface Alert {
  type: "warning" | "info" | "success" | "error";
  message: string;
  action: string;
}

export interface ClassDoc {
  id: string;
  teacherId: string;
  name: string;
  grade: string;
  section: string;
  studentIds: string[];
  createdAt?: any; // Firestore Timestamp
}

export type TeacherAlertType = "low_score" | "inactive_student" | "completed_session";
export type TeacherAlertSeverity = "info" | "warning" | "critical";

export interface TeacherAlertDoc {
  id: string;
  teacherId: string;
  studentId: string;
  type: TeacherAlertType;
  message: string;
  severity: TeacherAlertSeverity;
  createdAt: any; // Firestore Timestamp
}
