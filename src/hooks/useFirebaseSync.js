/**
 * useFirebaseSync.js
 * 
 * Custom hook to handle Firebase session rehydration and
 * automatic real-time data sync for workouts, nutrition, goals, and progress.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isFirebaseConfigured } from '../firebase/config';
import { subscribeToFirebaseAuthState } from '../firebase/authService';
import { setAuthSession } from '../store/slices/authSlice';
import { fetchWorkoutsFromFirebase } from '../firebase/workoutService';
import { setWorkouts } from '../store/slices/workoutSlice';
import { fetchMealsFromFirebase, fetchDailyGoalsFromFirebase } from '../firebase/nutritionService';
import { setMeals, setDailyGoal } from '../store/slices/nutritionSlice';
import { fetchProgressLogsFromFirebase } from '../firebase/progressService';
import { setProgressLogs } from '../store/slices/progressSlice';

export const useFirebaseSync = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // 1. Session rehydration observer on app launch
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = subscribeToFirebaseAuthState((session) => {
      if (session) {
        dispatch(setAuthSession(session));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const userUid = user?.uid;
  const userEmail = user?.email;

  // 2. Load user records from Cloud Firestore when user is logged in
  useEffect(() => {
    if (!isFirebaseConfigured || !userUid) return;

    let isMounted = true;
    const isRealUser = userEmail !== 'athlete@fitnesstracker.com' && userEmail !== 'admin@fitnesstracker.com';

    const loadUserData = async () => {
      try {
        // Workouts
        const workouts = await fetchWorkoutsFromFirebase(userUid);
        if (isMounted) {
          if (workouts.length > 0 || isRealUser) {
            dispatch(setWorkouts(workouts));
          }
        }

        // Meals
        const meals = await fetchMealsFromFirebase(userUid);
        if (isMounted) {
          if (meals.length > 0 || isRealUser) {
            dispatch(setMeals(meals));
          }
        }

        // Goals
        const goals = await fetchDailyGoalsFromFirebase(userUid);
        if (isMounted && goals) {
          dispatch(setDailyGoal(goals));
        }

        // Progress
        const logs = await fetchProgressLogsFromFirebase(userUid);
        if (isMounted) {
          if (logs.length > 0 || isRealUser) {
            dispatch(setProgressLogs(logs));
          }
        }
      } catch (error) {
        console.error('Error synchronizing user Firestore data:', error);
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [userUid, userEmail, dispatch]);
};

export default useFirebaseSync;
