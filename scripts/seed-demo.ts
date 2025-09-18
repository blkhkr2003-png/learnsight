import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { generateDemoStudent, finalizeStudentProfile } from "../utils/adaptive";

async function seedDemoData() {
  console.log("🌱 Seeding demo data...");

  try {
    // Create demo students
    const students = [
      finalizeStudentProfile(generateDemoStudent("Ram", "ram@example.com")),
      finalizeStudentProfile(generateDemoStudent("Shyam", "shyam@example.com")),
      finalizeStudentProfile(generateDemoStudent("Sanga", "sanga@example.com")),
    ];

    // Seed students
    for (const student of students) {
      await setDoc(doc(db, "students", student.id), student);
      console.log(`✅ Created student: ${student.name}`);
    }

    // Create demo teachers
    const teachers = [
      {
        id: "teacher_priya",
        name: "Priya Sharma",
        email: "priya@example.com",
        role: "teacher",
        classes: ["Class 10A", "Class 10B"],
        students: students.map((s) => s.id),
        createdAt: new Date(),
        lastActive: new Date(),
      },
    ];

    for (const teacher of teachers) {
      await setDoc(doc(db, "teachers", teacher.id), teacher);
      console.log(`✅ Created teacher: ${teacher.name}`);
    }

    // Create demo parents
    const parents = [
      {
        id: "parent_ram",
        name: "Ram's Parent",
        email: "ram.parent@example.com",
        role: "parent",
        children: ["student_ram"],
        createdAt: new Date(),
        lastActive: new Date(),
      },
    ];

    for (const parent of parents) {
      await setDoc(doc(db, "parents", parent.id), parent);
      console.log(`✅ Created parent: ${parent.name}`);
    }

    console.log("🎉 Demo data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
  }
}

// Run the seeding function
seedDemoData();
