
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
    }

    // Get recent students (with their latest diagnostic data)
    let recentStudents: RecentStudent[] = [];
    try {
      recentStudents = await getRecentDiagnosticAttemptsForStudents(students);
      console.log(`Processed ${recentStudents.length} recent students`);
    } catch (error) {
      console.error("Error processing recent students:", error);
      // Continue with empty recent students array
    }

    // Calculate class statistics
    const classStats = calculateClassStats(attempts);
    console.log("Class statistics calculated:", classStats);

    // Calculate average score
    const averageScore = calculateAverageScore(attempts);
    console.log(`Average score calculated: ${averageScore}%`);

    // Get teacher alerts
    let alerts: Alert[] = [];
    try {
      alerts = await getTeacherAlerts(teacherId);
      console.log(`Found ${alerts.length} alerts`);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      // Continue with empty alerts array
    }

    // Return all the dashboard data
    return {
      name: teacher.name,
      className,
      studentCount: students.length,
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
