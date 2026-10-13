/**
 * progressService.js
 * 
 * Cloud Firestore persistence service for body weight and milestone logs.
 * Saves logs under both:
 * 1. Top-level 'progress' collection for immediate visibility in Firebase Console
 * 2. User subcollection 'users/{userId}/progress'
 * 
 * Every record includes userName, userEmail, and userId so any administrator
 * or observer knows exactly which user logged the measurement.
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
 * Fetch all progress logs for a user ordered by date ascending
 */
export const fetchProgressLogsFromFirebase = async (userId) => {
  if (!isFirebaseConfigured || !db || !userId) return [];

  try {
    const progressColRef = collection(db, 'progress');
    const q = query(progressColRef, where('userId', '==', String(userId)));
    const snapshot = await getDocs(q);

    let list = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({ ...data, id: data.id || d.id });
    });

    if (list.length === 0) {
      const subColRef = collection(db, 'users', String(userId), 'progress');
      const subSnap = await getDocs(subColRef);
      subSnap.forEach((d) => {
        const data = d.data();
        list.push({ ...data, id: data.id || d.id });
      });
    }

    list.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    return list;
  } catch (error) {
    console.error('Error fetching progress logs from Firestore:', error);
    try {
      const subColRef = collection(db, 'users', String(userId), 'progress');
      const subSnap = await getDocs(subColRef);
      const list = [];
      subSnap.forEach((d) => {
        const data = d.data();
        list.push({ ...data, id: data.id || d.id });
      });
      list.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
      return list;
    } catch {
      return [];
    }
  }
};

/**
 * Add a progress log to Firestore with user identity metadata
 */
export const addProgressLogToFirebase = async (userId, logData, userMeta = {}) => {
  if (!isFirebaseConfigured || !db || !userId) return logData;

  try {
    const logId = String(logData.id || Date.now());
    const payload = {
      id: logId,
      userId: String(userId),
      userName: String(userMeta.name || logData.userName || 'Athlete'),
      userEmail: String(userMeta.email || logData.userEmail || ''),
      weight: Number(logData.weight) || 0,
      bodyFat: logData.bodyFat ? Number(logData.bodyFat) : null,
      date: logData.date || new Date().toISOString().split('T')[0],
      createdAt: logData.createdAt || new Date().toISOString()
    };

    const topDocRef = doc(db, 'progress', `${userId}_${logId}`);
    const subDocRef = doc(db, 'users', String(userId), 'progress', logId);

    await Promise.all([
      setDoc(topDocRef, payload),
      setDoc(subDocRef, payload)
    ]);

    return payload;
  } catch (error) {
    console.error('Error saving progress log to Firestore:', error);
    return logData;
  }
};

/**
 * Delete a progress log from Firestore
 */
export const deleteProgressLogFromFirebase = async (userId, logId) => {
  if (!isFirebaseConfigured || !db || !userId) return true;

  try {
    const topDocRef = doc(db, 'progress', `${userId}_${logId}`);
    const subDocRef = doc(db, 'users', String(userId), 'progress', logId);

    await Promise.all([
      deleteDoc(topDocRef).catch(() => {}),
      deleteDoc(subDocRef).catch(() => {})
    ]);

    return true;
  } catch (error) {
    console.error('Error deleting progress log from Firestore:', error);
    return false;
  }
};
