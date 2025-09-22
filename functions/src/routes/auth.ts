import { Router } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { db, serverTimestamp } from '@/utils/firebase';
import { UserSchema } from '@/utils/validation';
import { User } from '@/types';

const router = Router();

/**
 * POST /auth/signup
 * Create a new user account with role-based claims
 */
router.post('/signup', async (req, res) => {
  try {
    const validatedData = UserSchema.parse(req.body);
    const { email, displayName, role, profile = {} } = validatedData;

    // Create user in Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      displayName,
    });

    // Set custom claims for role-based access
    await getAuth().setCustomUserClaims(userRecord.uid, {
      role,
      createdAt: Date.now(),
    });

    // Create user document in Firestore
    const userData: User = {
      uid: userRecord.uid,
      email,
      displayName,
      role,
      createdAt: serverTimestamp(),
      profile: {
        timezone: 'UTC',
        ...profile,
      },
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // Initialize student skills if role is student
    if (role === 'student') {
      await db.collection('studentSkills').doc(userRecord.uid).set({
        skills: {},
        updatedAt: serverTimestamp(),
      });
    }

    res.status(201).json({
      success: true,
      user: {
        uid: userRecord.uid,
        email,
        displayName,
        role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('email-already-exists')) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }
      if (error.message.includes('invalid-email')) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }
    }

    res.status(500).json({ error: 'Failed to create user account' });
  }
});

/**
 * POST /auth/set-role
 * Admin endpoint to set user roles
 */
router.post('/set-role', async (req, res) => {
  try {
    const { uid, role } = req.body;

    if (!uid || !role) {
      res.status(400).json({ error: 'Missing uid or role' });
      return;
    }

    if (!['student', 'teacher', 'parent', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    // Set custom claims
    await getAuth().setCustomUserClaims(uid, { role });

    // Update user document
    await db.collection('users').doc(uid).update({
      role,
      updatedAt: serverTimestamp(),
    });

    res.json({ success: true, message: 'Role updated successfully' });
  } catch (error) {
    console.error('Set role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;