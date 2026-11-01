/**
 * notificationService.js
 * 
 * Cloud Firestore persistence service for notifications.
 * Dual-sync storage:
 * 1. Root collection 'notifications' with document id `${userId}_${notificationId}`
 * 2. User subcollection 'users/{userId}/notifications/{notificationId}'
 * 
 * Every record includes userName, userEmail, and userId for complete visibility.
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
 * Fetch all notifications for a specific user ordered by date descending
 */
export const fetchNotificationsFromFirebase = async (userId) => {
  if (!isFirebaseConfigured || !db || !userId) return [];

  try {
    const notifsColRef = collection(db, 'notifications');
    const q = query(notifsColRef, where('userId', '==', String(userId)));
    const snapshot = await getDocs(q);

    let list = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({ ...data, id: data.id || d.id });
    });

    if (list.length === 0) {
      const subColRef = collection(db, 'users', String(userId), 'notifications');
      const subSnap = await getDocs(subColRef);
      subSnap.forEach((d) => {
        const data = d.data();
        list.push({ ...data, id: data.id || d.id });
      });
    }

    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return list;
  } catch (error) {
    console.error('Error fetching notifications from Firestore:', error);
    try {
      const subColRef = collection(db, 'users', String(userId), 'notifications');
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
 * Add a notification to Firestore
 */
export const addNotificationToFirebase = async (userId, notificationData, userMeta = {}) => {
  if (!isFirebaseConfigured || !db || !userId) return notificationData;

  try {
    const notificationId = String(notificationData.id || Date.now());
    const payload = {
      id: notificationId,
      userId: String(userId),
      userName: String(userMeta.name || notificationData.userName || 'Athlete'),
      userEmail: String(userMeta.email || notificationData.userEmail || ''),
      category: String(notificationData.category || 'System'),
      title: String(notificationData.title || 'Notification'),
      message: String(notificationData.message || ''),
      read: Boolean(notificationData.read || false),
      date: notificationData.date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const topDocRef = doc(db, 'notifications', `${userId}_${notificationId}`);
    const subDocRef = doc(db, 'users', String(userId), 'notifications', notificationId);

    await Promise.all([
      setDoc(topDocRef, payload),
      setDoc(subDocRef, payload)
    ]);

    return payload;
  } catch (error) {
    console.error('Error saving notification to Firestore:', error);
    return notificationData;
  }
};

/**
 * Update read status of a single notification in Firestore
 */
export const updateNotificationReadInFirebase = async (userId, notificationId, readStatus = true) => {
  if (!isFirebaseConfigured || !db || !userId) return;

  try {
    const topDocRef = doc(db, 'notifications', `${userId}_${notificationId}`);
    const subDocRef = doc(db, 'users', String(userId), 'notifications', String(notificationId));

    await Promise.all([
      setDoc(topDocRef, { read: readStatus, updatedAt: new Date().toISOString() }, { merge: true }),
      setDoc(subDocRef, { read: readStatus, updatedAt: new Date().toISOString() }, { merge: true })
    ]);
  } catch (error) {
    console.error('Error updating notification read status in Firestore:', error);
  }
};

/**
 * Mark all notifications as read in Firestore
 */
export const markAllNotificationsReadInFirebase = async (userId, notificationIds = []) => {
  if (!isFirebaseConfigured || !db || !userId || !notificationIds.length) return;

  try {
    const promises = notificationIds.map((id) => updateNotificationReadInFirebase(userId, id, true));
    await Promise.all(promises);
  } catch (error) {
    console.error('Error marking all notifications as read in Firestore:', error);
  }
};

/**
 * Delete a notification from Firestore
 */
export const deleteNotificationFromFirebase = async (userId, notificationId) => {
  if (!isFirebaseConfigured || !db || !userId) return true;

  try {
    const topDocRef = doc(db, 'notifications', `${userId}_${notificationId}`);
    const subDocRef = doc(db, 'users', String(userId), 'notifications', String(notificationId));

    await Promise.all([
      deleteDoc(topDocRef).catch(() => {}),
      deleteDoc(subDocRef).catch(() => {})
    ]);

    return true;
  } catch (error) {
    console.error('Error deleting notification from Firestore:', error);
    return false;
  }
};
