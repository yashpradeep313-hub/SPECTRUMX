/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserProfile, CourseMetadata } from '../types';

// Initialize Firebase App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Auto-authenticate anonymously for seamless demo experience
export const initAnonymousAuth = async (): Promise<FirebaseUser | null> => {
  try {
    if (!auth.currentUser) {
      const cred = await signInAnonymously(auth);
      return cred.user;
    }
    return auth.currentUser;
  } catch (error) {
    console.warn('[Firebase] Anonymous sign-in note:', error);
    return null;
  }
};

/**
 * Save or update student profile in Firestore
 */
export const saveUserToFirebase = async (user: UserProfile): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(
      userRef,
      {
        ...user,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('[Firebase] Error saving user to Firestore:', err);
    return false;
  }
};

/**
 * Retrieve user profile from Firestore
 */
export const getUserFromFirebase = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('[Firebase] Error fetching user from Firestore:', err);
  }
  return null;
};

/**
 * Save syllabus document to Firestore
 */
export const saveSyllabusToFirebase = async (syllabus: any): Promise<boolean> => {
  try {
    const sRef = doc(db, 'syllabi', syllabus.id || 'current-syllabus');
    await setDoc(sRef, {
      ...syllabus,
      savedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('[Firebase] Error saving syllabus to Firestore:', err);
    return false;
  }
};

/**
 * Save PYQ to Firestore
 */
export const savePyqToFirebase = async (pyq: any): Promise<boolean> => {
  try {
    const pRef = doc(db, 'pyqs', pyq.id);
    await setDoc(pRef, {
      ...pyq,
      savedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('[Firebase] Error saving PYQ to Firestore:', err);
    return false;
  }
};

/**
 * Retrieve all PYQs from Firestore
 */
export const getPyqsFromFirebase = async (): Promise<any[]> => {
  try {
    const colRef = collection(db, 'pyqs');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.warn('[Firebase] Error fetching PYQs from Firestore:', err);
    return [];
  }
};

/**
 * Save custom course domain to Firestore
 */
export const saveCourseDomainToFirebase = async (course: CourseMetadata): Promise<boolean> => {
  try {
    const cRef = doc(db, 'courses', course.id);
    await setDoc(cRef, {
      ...course,
      savedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('[Firebase] Error saving course domain to Firestore:', err);
    return false;
  }
};

/**
 * Save diagnostic assessment result to Firestore
 */
export const saveAssessmentToFirebase = async (assessment: any): Promise<boolean> => {
  try {
    const aRef = doc(db, 'assessments', assessment.id || `assessment-${Date.now()}`);
    await setDoc(aRef, {
      ...assessment,
      savedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('[Firebase] Error saving assessment to Firestore:', err);
    return false;
  }
};

export default {
  app,
  auth,
  db,
  initAnonymousAuth,
  saveUserToFirebase,
  getUserFromFirebase,
  saveSyllabusToFirebase,
  savePyqToFirebase,
  getPyqsFromFirebase,
  saveCourseDomainToFirebase,
  saveAssessmentToFirebase,
};
