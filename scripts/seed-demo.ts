#!/usr/bin/env node

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'learnsight-demo',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.projectId,
});

const db = getFirestore();
const auth = getAuth();

// Sample data
const sampleUsers = [
  {
    email: 'student1@demo.com',
    displayName: 'Ram Kumar',
    role: 'student',
    profile: { grade: '10', timezone: 'Asia/Kolkata' },
  },
  {
    email: 'student2@demo.com',
    displayName: 'Shyam Patel',
    role: 'student',
    profile: { grade: '10', timezone: 'Asia/Kolkata' },
  },
  {
    email: 'student3@demo.com',
    displayName: 'Sanga Sharma',
    role: 'student',
    profile: { grade: '10', timezone: 'Asia/Kolkata' },
  },
  {
    email: 'teacher1@demo.com',
    displayName: 'Ms. Sarah Johnson',
    role: 'teacher',
    profile: { subject: 'Mathematics', timezone: 'Asia/Kolkata' },
  },
  {
    email: 'parent1@demo.com',
    displayName: 'Mr. Rajesh Kumar',
    role: 'parent',
    profile: { children: ['student1'], timezone: 'Asia/Kolkata' },
  },
  {
    email: 'admin@demo.com',
    displayName: 'Admin User',
    role: 'admin',
    profile: { timezone: 'Asia/Kolkata' },
  },
];

const sampleQuestions = [
  // Listening questions
  {
    stem: 'Listen to the audio clip about climate change. What is the main cause mentioned?',
    type: 'mcq',
    choices: [
      { id: 'A', text: 'Industrial emissions' },
      { id: 'B', text: 'Deforestation' },
      { id: 'C', text: 'Vehicle pollution' },
      { id: 'D', text: 'All of the above' },
    ],
    answer: 'D',
    difficulty: 0.6,
    tags: ['listening', 'environment', 'comprehension'],
    skill: 'listening',
    subject: 'Environmental Science',
  },
  {
    stem: 'Based on the audio lecture, what percentage of water covers Earth?',
    type: 'mcq',
    choices: [
      { id: 'A', text: '65%' },
      { id: 'B', text: '71%' },
      { id: 'C', text: '75%' },
      { id: 'D', text: '80%' },
    ],
    answer: 'B',
    difficulty: 0.4,
    tags: ['listening', 'geography', 'facts'],
    skill: 'listening',
    subject: 'Geography',
  },

  // Grasping/Comprehension questions
  {
    stem: 'Read the passage about photosynthesis. What is the primary function of chlorophyll?',
    type: 'mcq',
    choices: [
      { id: 'A', text: 'To absorb water' },
      { id: 'B', text: 'To capture light energy' },
      { id: 'C', text: 'To release oxygen' },
      { id: 'D', text: 'To store glucose' },
    ],
    answer: 'B',
    difficulty: 0.5,
    tags: ['reading', 'comprehension', 'biology'],
    skill: 'grasping',
    subject: 'Biology',
  },
  {
    stem: 'According to the text, what was the main reason for the Industrial Revolution?',
    type: 'mcq',
    choices: [
      { id: 'A', text: 'Population growth' },
      { id: 'B', text: 'Technological innovations' },
      { id: 'C', text: 'Political changes' },
      { id: 'D', text: 'Economic necessity' },
    ],
    answer: 'B',
    difficulty: 0.7,
    tags: ['reading', 'comprehension', 'history'],
    skill: 'grasping',
    subject: 'History',
  },

  // Retention/Memory questions
  {
    stem: 'Earlier in this lesson, we learned about the periodic table. How many elements are in the first period?',
    type: 'mcq',
    choices: [
      { id: 'A', text: '1' },
      { id: 'B', text: '2' },
      { id: 'C', text: '8' },
      { id: 'D', text: '18' },
    ],
    answer: 'B',
    difficulty: 0.3,
    tags: ['memory', 'recall', 'chemistry'],
    skill: 'retention',
    subject: 'Chemistry',
  },
  {
    stem: 'What was the formula for the area of a triangle that we studied yesterday?',
    type: 'mcq',
    choices: [
      { id: 'A', text: 'base × height' },
      { id: 'B', text: '½ × base × height' },
      { id: 'C', text: 'base + height' },
      { id: 'D', text: '2 × base × height' },
    ],
    answer: 'B',
    difficulty: 0.2,
    tags: ['memory', 'recall', 'geometry'],
    skill: 'retention',
    subject: 'Mathematics',
  },

  // Application questions
  {
    stem: 'If a car travels 60 km/h for 2.5 hours, how far does it travel?',
    type: 'mcq',
    choices: [
      { id: 'A', text: '120 km' },
      { id: 'B', text: '150 km' },
      { id: 'C', text: '180 km' },
      { id: 'D', text: '200 km' },
    ],
    answer: 'B',
    difficulty: 0.4,
    tags: ['application', 'problem-solving', 'physics'],
    skill: 'application',
    subject: 'Physics',
  },
  {
    stem: 'A recipe calls for 3 cups of flour for 12 cookies. How much flour is needed for 20 cookies?',
    type: 'mcq',
    choices: [
      { id: 'A', text: '4 cups' },
      { id: 'B', text: '5 cups' },
      { id: 'C', text: '6 cups' },
      { id: 'D', text: '7 cups' },
    ],
    answer: 'B',
    difficulty: 0.6,
    tags: ['application', 'problem-solving', 'ratios'],
    skill: 'application',
    subject: 'Mathematics',
  },

  // Additional questions for variety
  {
    stem: 'What is the capital of France?',
    type: 'mcq',
    choices: [
      { id: 'A', text: 'London' },
      { id: 'B', text: 'Berlin' },
      { id: 'C', text: 'Paris' },
      { id: 'D', text: 'Madrid' },
    ],
    answer: 'C',
    difficulty: 0.1,
    tags: ['geography', 'facts'],
    skill: 'retention',
    subject: 'Geography',
  },
  {
    stem: 'Which planet is closest to the Sun?',
    type: 'mcq',
    choices: [
      { id: 'A', text: 'Venus' },
      { id: 'B', text: 'Mercury' },
      { id: 'C', text: 'Earth' },
      { id: 'D', text: 'Mars' },
    ],
    answer: 'B',
    difficulty: 0.2,
    tags: ['astronomy', 'facts'],
    skill: 'retention',
    subject: 'Science',
  },
];

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  for (const userData of sampleUsers) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: userData.email,
        displayName: userData.displayName,
        password: 'demo123456', // Default password for demo
      });

      // Set custom claims
      await auth.setCustomUserClaims(userRecord.uid, {
        role: userData.role,
      });

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        createdAt: Timestamp.now(),
        profile: userData.profile,
      });

      // Initialize student skills for students
      if (userData.role === 'student') {
        await db.collection('studentSkills').doc(userRecord.uid).set({
          skills: {
            listening: { theta: Math.random() * 2 - 1, attempts: 0, lastSeen: Timestamp.now() },
            grasping: { theta: Math.random() * 2 - 1, attempts: 0, lastSeen: Timestamp.now() },
            retention: { theta: Math.random() * 2 - 1, attempts: 0, lastSeen: Timestamp.now() },
            application: { theta: Math.random() * 2 - 1, attempts: 0, lastSeen: Timestamp.now() },
          },
          updatedAt: Timestamp.now(),
        });
      }

      console.log(`✅ Created user: ${userData.displayName} (${userData.email})`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }
}

async function seedQuestions() {
  console.log('🌱 Seeding questions...');
  
  for (const questionData of sampleQuestions) {
    try {
      await db.collection('questions').add({
        ...questionData,
        createdAt: Timestamp.now(),
      });
      
      console.log(`✅ Created question: ${questionData.stem.substring(0, 50)}...`);
    } catch (error) {
      console.error('❌ Error creating question:', error);
    }
  }

  // Generate additional questions for more variety
  console.log('🌱 Generating additional questions...');
  
  const skills = ['listening', 'grasping', 'retention', 'application'];
  const subjects = ['Mathematics', 'Science', 'History', 'Geography', 'English'];
  
  for (let i = 0; i < 50; i++) {
    const skill = skills[Math.floor(Math.random() * skills.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const difficulty = Math.random();
    
    const questionData = {
      stem: `Sample ${skill} question ${i + 1} for ${subject}. This is a generated question for testing purposes.`,
      type: 'mcq',
      choices: [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' },
        { id: 'C', text: 'Option C' },
        { id: 'D', text: 'Option D' },
      ],
      answer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      difficulty,
      tags: [skill, subject.toLowerCase()],
      skill,
      subject,
      createdAt: Timestamp.now(),
    };
    
    try {
      await db.collection('questions').add(questionData);
    } catch (error) {
      console.error(`❌ Error creating generated question ${i + 1}:`, error);
    }
  }
  
  console.log('✅ Generated 50 additional questions');
}

async function seedSampleResponses() {
  console.log('🌱 Seeding sample responses...');
  
  // Get all users and questions
  const usersSnapshot = await db.collection('users').where('role', '==', 'student').get();
  const questionsSnapshot = await db.collection('questions').limit(20).get();
  
  const students = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const questions = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  for (const student of students) {
    // Generate 5-10 sample responses per student
    const responseCount = Math.floor(Math.random() * 6) + 5;
    
    for (let i = 0; i < responseCount; i++) {
      const question = questions[Math.floor(Math.random() * questions.length)];
      const isCorrect = Math.random() > 0.3; // 70% correct rate
      const selected = isCorrect ? question.answer : 
        question.choices[Math.floor(Math.random() * question.choices.length)].id;
      
      const responseData = {
        userId: student.id,
        questionId: question.id,
        submittedAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random time in last 7 days
        durationMs: Math.floor(Math.random() * 120000) + 10000, // 10s to 2min
        selected,
        correct: isCorrect,
        hintsUsed: Math.floor(Math.random() * 3),
        score: isCorrect ? (1 - Math.random() * 0.2) : Math.random() * 0.3, // Correct: 0.8-1.0, Incorrect: 0.0-0.3
        skill: question.skill,
      };
      
      try {
        await db.collection('responses').add(responseData);
      } catch (error) {
        console.error('❌ Error creating sample response:', error);
      }
    }
    
    console.log(`✅ Created sample responses for ${student.displayName}`);
  }
}

async function main() {
  try {
    console.log('🚀 Starting LearnSight demo data seeding...\n');
    
    await seedUsers();
    console.log('');
    
    await seedQuestions();
    console.log('');
    
    await seedSampleResponses();
    console.log('');
    
    console.log('🎉 Demo data seeding completed successfully!');
    console.log('\nDemo credentials:');
    console.log('Students: student1@demo.com, student2@demo.com, student3@demo.com');
    console.log('Teacher: teacher1@demo.com');
    console.log('Parent: parent1@demo.com');
    console.log('Admin: admin@demo.com');
    console.log('Password for all: demo123456');
    
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  main();
}

export { main as seedDemoData };