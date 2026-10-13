/**
 * nutritionService.js
 * 
 * Cloud Firestore persistence service for meals and macro goals.
 * Saves meals under both:
 * 1. Top-level 'meals' collection for immediate visibility in Firebase Console
 * 2. User subcollection 'users/{userId}/meals'
 * Saves daily goals under both:
 * 1. Top-level 'nutritionGoals/{userId}'
 * 2. User subcollection 'users/{userId}/settings/nutritionGoals'
 * 
 * Every record includes userName, userEmail, and userId so any administrator
 * or observer knows exactly which user ate/logged the meal.
 */

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

/**
 * Fetch all meals for a specific user ordered by date descending
 */
export const fetchMealsFromFirebase = async (userId) => {
  if (!isFirebaseConfigured || !db || !userId) return [];

  try {
    // 1. Query top-level 'meals' collection
    const mealsColRef = collection(db, 'meals');
    const q = query(mealsColRef, where('userId', '==', String(userId)));
    const snapshot = await getDocs(q);

    let list = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({ ...data, id: data.id || d.id });
    });

    // 2. Fallback to subcollection
    if (list.length === 0) {
      const subColRef = collection(db, 'users', String(userId), 'meals');
      const subSnap = await getDocs(subColRef);
      subSnap.forEach((d) => {
        const data = d.data();
        list.push({ ...data, id: data.id || d.id });
      });
    }

    // Sort in memory by date descending
    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    return list;
  } catch (error) {
    console.error('Error fetching meals from Firestore:', error);
    try {
      const subColRef = collection(db, 'users', String(userId), 'meals');
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
 * Add a new meal log to Firestore with user identity metadata
 */
export const addMealToFirebase = async (userId, mealData, userMeta = {}) => {
  if (!isFirebaseConfigured || !db || !userId) return mealData;

  try {
    const mealId = String(mealData.id || Date.now());
    const userName = String(userMeta.name || mealData.userName || 'Athlete');
    const userEmail = String(userMeta.email || mealData.userEmail || '');

    // Sanitize payload to avoid undefined fields
    const payload = {
      id: mealId,
      userId: String(userId),
      userName,
      userEmail,
      mealName: String(mealData.mealName || ''),
      mealType: String(mealData.mealType || 'Meal'),
      calories: Number(mealData.calories) || 0,
      protein: Number(mealData.protein) || 0,
      carbs: Number(mealData.carbs) || 0,
      fats: Number(mealData.fats) || 0,
      date: mealData.date || new Date().toISOString().split('T')[0],
      createdAt: mealData.createdAt || new Date().toISOString()
    };

    const topDocRef = doc(db, 'meals', `${userId}_${mealId}`);
    const subDocRef = doc(db, 'users', String(userId), 'meals', mealId);

    await Promise.all([
      setDoc(topDocRef, payload),
      setDoc(subDocRef, payload)
    ]);

    return payload;
  } catch (error) {
    console.error('Error saving meal to Firestore:', error);
    return mealData;
  }
};

/**
 * Update an existing meal in Firestore
 */
export const updateMealInFirebase = async (userId, mealId, updatedData, userMeta = {}) => {
  if (!isFirebaseConfigured || !db || !userId) return updatedData;

  try {
    const cleanData = {
      ...updatedData,
      id: String(mealId),
      userId: String(userId),
      userName: String(userMeta.name || updatedData.userName || 'Athlete'),
      userEmail: String(userMeta.email || updatedData.userEmail || ''),
      calories: Number(updatedData.calories) || 0,
      protein: Number(updatedData.protein) || 0,
      carbs: Number(updatedData.carbs) || 0,
      fats: Number(updatedData.fats) || 0,
      updatedAt: new Date().toISOString()
    };

    const topDocRef = doc(db, 'meals', `${userId}_${mealId}`);
    const subDocRef = doc(db, 'users', String(userId), 'meals', String(mealId));

    await Promise.all([
      setDoc(topDocRef, cleanData, { merge: true }),
      setDoc(subDocRef, cleanData, { merge: true })
    ]);

    return { id: String(mealId), ...updatedData };
  } catch (error) {
    console.error('Error updating meal in Firestore:', error);
    return updatedData;
  }
};

/**
 * Delete a meal from Firestore
 */
export const deleteMealFromFirebase = async (userId, mealId) => {
  if (!isFirebaseConfigured || !db || !userId) return true;

  try {
    const topDocRef = doc(db, 'meals', `${userId}_${mealId}`);
    const subDocRef = doc(db, 'users', String(userId), 'meals', String(mealId));

    await Promise.all([
      deleteDoc(topDocRef).catch(() => {}),
      deleteDoc(subDocRef).catch(() => {})
    ]);

    return true;
  } catch (error) {
    console.error('Error deleting meal from Firestore:', error);
    return false;
  }
};

/**
 * Fetch daily nutrition goals (calories, protein, carbs, fats)
 */
export const fetchDailyGoalsFromFirebase = async (userId) => {
  if (!isFirebaseConfigured || !db || !userId) return null;

  try {
    // Check top-level goals collection first
    const topDocRef = doc(db, 'nutritionGoals', String(userId));
    const topSnap = await getDoc(topDocRef);
    if (topSnap.exists()) return topSnap.data();

    // Fallback to subcollection
    const subDocRef = doc(db, 'users', String(userId), 'settings', 'nutritionGoals');
    const subSnap = await getDoc(subDocRef);
    return subSnap.exists() ? subSnap.data() : null;
  } catch (error) {
    console.error('Error fetching goals from Firestore:', error);
    return null;
  }
};

/**
 * Save daily nutrition goals to Firestore
 */
export const saveDailyGoalsToFirebase = async (userId, goals, userMeta = {}) => {
  if (!isFirebaseConfigured || !db || !userId) return goals;

  try {
    const cleanGoals = {
      userId: String(userId),
      userName: String(userMeta.name || 'Athlete'),
      userEmail: String(userMeta.email || ''),
      calories: Number(goals.calories) || 2500,
      protein: Number(goals.protein) || 150,
      carbs: Number(goals.carbs) || 300,
      fats: Number(goals.fats) || 70,
      updatedAt: new Date().toISOString()
    };

    const topDocRef = doc(db, 'nutritionGoals', String(userId));
    const subDocRef = doc(db, 'users', String(userId), 'settings', 'nutritionGoals');

    await Promise.all([
      setDoc(topDocRef, cleanGoals, { merge: true }),
      setDoc(subDocRef, cleanGoals, { merge: true })
    ]);

    return goals;
  } catch (error) {
    console.error('Error saving goals to Firestore:', error);
    return goals;
  }
};
