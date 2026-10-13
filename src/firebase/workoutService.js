/**
 * workoutService.js
 * 
 * Cloud Firestore persistence service for workouts.
 * Saves user workouts under both:
 * 1. Top-level 'workouts' collection for immediate visibility in Firebase Console
 * 2. User subcollection 'users/{userId}/workouts'
 * 
 * Every record includes userName, userEmail, and userId so any administrator
 * or observer knows exactly which user performed the workout.
 */

import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

/**
 * Fetch all workouts for a specific user ordered by date descending
 */
export const fetchWorkoutsFromFirebase = async (userId) => {
  if (!isFirebaseConfigured || !db || !userId) return [];

  try {
    // 1. Query top-level collection by userId
    const workoutsColRef = collection(db, 'workouts');
    const q = query(workoutsColRef, where('userId', '==', String(userId)));
    const snapshot = await getDocs(q);

    let list = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({ ...data, id: data.id || d.id });
    });

    // 2. If top-level is empty, check user subcollection for backwards compatibility
    if (list.length === 0) {
      const subColRef = collection(db, 'users', String(userId), 'workouts');
      const subSnap = await getDocs(subColRef);
      subSnap.forEach((d) => {
        const data = d.data();
        list.push({ ...data, id: data.id || d.id });
      });
    }

    // Sort in memory by date descending (guarantees order without requiring custom composite index)
    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    return list;
  } catch (error) {
    console.error('Error fetching workouts from Firestore:', error);
    // Subcollection fallback
    try {
      const subColRef = collection(db, 'users', String(userId), 'workouts');
      const subSnap = await getDocs(subColRef);
      const list = [];
      subSnap.forEach((d) => {
        const data = d.data();
        list.push({ ...data, id: data.id || d.id });
      });
      list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      return list;
    } catch {
      return [];
    }
  }
};

/**
 * Add a new workout log to Firestore with user identity metadata
 */
export const addWorkoutToFirebase = async (userId, workoutData, userMeta = {}) => {
  if (!isFirebaseConfigured || !db || !userId) return workoutData;

  try {
    const workoutId = String(workoutData.id || Date.now());
    const userName = String(userMeta.name || workoutData.userName || 'Athlete');
    const userEmail = String(userMeta.email || workoutData.userEmail || '');
    
    // Sanitize payload to prevent undefined fields
    const payload = {
      id: workoutId,
      userId: String(userId),
      userName,
      userEmail,
      exerciseName: String(workoutData.exerciseName || ''),
      muscleGroup: String(workoutData.muscleGroup || 'General'),
      sets: Number(workoutData.sets) || 1,
      reps: Number(workoutData.reps) || 1,
      weight: Number(workoutData.weight) || 0,
      date: workoutData.date || new Date().toISOString().split('T')[0],
      duration: Number(workoutData.duration) || 30,
      createdAt: workoutData.createdAt || new Date().toISOString()
    };

    const topDocRef = doc(db, 'workouts', `${userId}_${workoutId}`);
    const subDocRef = doc(db, 'users', String(userId), 'workouts', workoutId);

    await Promise.all([
      setDoc(topDocRef, payload),
      setDoc(subDocRef, payload)
    ]);

    return payload;
  } catch (error) {
    console.error('Error saving workout to Firestore:', error);
    return workoutData;
  }
};

/**
 * Update an existing workout log in Firestore
 */
export const updateWorkoutInFirebase = async (userId, workoutId, updatedData, userMeta = {}) => {
  if (!isFirebaseConfigured || !db || !userId) return updatedData;

  try {
    const cleanData = {
      ...updatedData,
      id: String(workoutId),
      userId: String(userId),
      userName: String(userMeta.name || updatedData.userName || 'Athlete'),
      userEmail: String(userMeta.email || updatedData.userEmail || ''),
      updatedAt: new Date().toISOString()
    };

    const topDocRef = doc(db, 'workouts', `${userId}_${workoutId}`);
    const subDocRef = doc(db, 'users', String(userId), 'workouts', String(workoutId));

    await Promise.all([
      setDoc(topDocRef, cleanData, { merge: true }),
      setDoc(subDocRef, cleanData, { merge: true })
    ]);

    return { id: String(workoutId), ...updatedData };
  } catch (error) {
    console.error('Error updating workout in Firestore:', error);
    return updatedData;
  }
};

/**
 * Delete a workout log from Firestore
 */
export const deleteWorkoutFromFirebase = async (userId, workoutId) => {
  if (!isFirebaseConfigured || !db || !userId) return true;

  try {
    const topDocRef = doc(db, 'workouts', `${userId}_${workoutId}`);
    const subDocRef = doc(db, 'users', String(userId), 'workouts', String(workoutId));

    await Promise.all([
      deleteDoc(topDocRef).catch(() => {}),
      deleteDoc(subDocRef).catch(() => {})
    ]);

    return true;
  } catch (error) {
    console.error('Error deleting workout from Firestore:', error);
    return false;
  }
};
