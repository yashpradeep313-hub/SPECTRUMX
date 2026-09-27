/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { UserProfile } from '../../types';

const router = Router();

// GET all users
router.get('/users', (req: Request, res: Response) => {
  const users = dbStore.getUsers();
  res.json({
    success: true,
    total: users.length,
    users,
  });
});

// GET current user
router.get('/me', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  if (!userId) {
    const defaultUser = dbStore.getUsers()[0];
    return res.json({ success: true, user: defaultUser });
  }

  const user = dbStore.getUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.json({ success: true, user });
});

// GET user by ID
router.get('/users/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const user = dbStore.getUserById(id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, user });
});

// POST login
router.post('/login', (req: Request, res: Response) => {
  const { email, userId } = req.body;

  let user: UserProfile | undefined;
  if (userId) {
    user = dbStore.getUserById(userId);
  } else if (email) {
    user = dbStore.getUserByEmail(email);
  }

  if (!user) {
    // If logging in with demo email or username, auto-create a user profile
    if (email) {
      const cleanName = email.split('@')[0].replace(/[._]/g, ' ');
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        email,
        avatar: '🎓',
        role: 'Student',
        enrolledCourseIds: ['python-core'],
        currentGoal: 'Adaptive Mastery & Exam Excellence',
        level: 'Intermediate',
        streakDays: 1,
        totalStudyMinutes: 20,
        learningVelocity: 'Steady',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
      dbStore.saveUser(newUser);
      return res.json({ success: true, user: newUser, isNewUser: true });
    }

    return res.status(401).json({ success: false, error: 'Invalid user credentials.' });
  }

  res.json({ success: true, user });
});

// POST register
router.post('/register', (req: Request, res: Response) => {
  const { name, email, role, avatar, currentGoal, level } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  const existing = dbStore.getUserByEmail(email);
  if (existing) {
    return res.json({
      success: true,
      user: existing,
      message: 'Account already exists. Logged in successfully.',
    });
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    avatar: avatar || '👩‍💻',
    role: role || 'Student',
    enrolledCourseIds: ['python-core'],
    currentGoal: currentGoal || 'Master Prerequisite Invariants & Exam Problem-Solving',
    level: level || 'Beginner',
    streakDays: 1,
    totalStudyMinutes: 15,
    learningVelocity: 'Steady',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };

  dbStore.saveUser(newUser);
  res.status(201).json({ success: true, user: newUser, message: 'Account registered successfully.' });
});

// PUT update profile
router.put('/profile', (req: Request, res: Response) => {
  const { id, name, avatar, currentGoal, level, streakDays, totalStudyMinutes, learningVelocity, enrolledCourseIds } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'User ID is required.' });
  }

  const user = dbStore.getUserById(id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const updated: UserProfile = {
    ...user,
    ...(name ? { name } : {}),
    ...(avatar ? { avatar } : {}),
    ...(currentGoal ? { currentGoal } : {}),
    ...(level ? { level } : {}),
    ...(typeof streakDays === 'number' ? { streakDays } : {}),
    ...(typeof totalStudyMinutes === 'number' ? { totalStudyMinutes } : {}),
    ...(learningVelocity ? { learningVelocity } : {}),
    ...(Array.isArray(enrolledCourseIds) ? { enrolledCourseIds } : {}),
  };

  dbStore.saveUser(updated);
  res.json({ success: true, user: updated, message: 'Profile updated successfully.' });
});

export default router;
