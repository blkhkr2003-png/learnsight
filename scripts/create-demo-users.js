
// This is a simple script to add demo users to the system
// Run this script in the browser console or as a standalone script

const demoUsers = [
  {
    email: "ram@demo.com",
    password: "password",
    name: "Ram Kumar",
    role: "student",
    isApproved: true
  },
  {
    email: "teacher@demo.com",
    password: "password",
    name: "Demo Teacher",
    role: "teacher",
    isApproved: true
  },
  {
    email: "parent@demo.com",
    password: "password",
    name: "Demo Parent",
    role: "parent",
    isApproved: true
  }
];

// Function to create demo users
async function createDemoUsers() {
  try {
    for (const user of demoUsers) {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      const result = await response.json();

      if (result.error) {
        console.error(`Error creating ${user.email}:`, result.error);
      } else {
        console.log(`Successfully created user: ${user.email} with role: ${user.role}`);
      }
    }

    console.log('Demo users creation completed!');
  } catch (error) {
    console.error('Error creating demo users:', error);
  }
}

// Auto-run if this script is loaded in a browser
if (typeof window !== 'undefined') {
  console.log('Creating demo users...');
  createDemoUsers();
}
