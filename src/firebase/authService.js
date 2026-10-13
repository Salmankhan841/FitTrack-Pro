/**
 * authService.js
 * 
 * Firebase Authentication Service.
 * Manages user registration, login, logout, and auth state observer with Firestore sync.
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';

/**
 * Register a new user with Firebase Auth and initialize Firestore user document
 */
export const registerWithFirebase = async (email, password, name) => {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase is not configured. Please supply keys in .env');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Update Auth Profile Display Name
  if (name) {
    await updateFirebaseProfile(firebaseUser, { displayName: name });
  }

  // Create initial user document in Firestore
  const userData = {
    uid: firebaseUser.uid,
    name: name || email.split('@')[0],
    email: firebaseUser.email,
    role: 'user',
    age: 25,
    weight: 75,
    height: 180,
    gender: 'Male',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), userData);

  const token = await firebaseUser.getIdToken();

  return {
    user: userData,
    token
  };
};

/**
 * Log in existing user with Firebase Auth and retrieve profile from Firestore
 */
export const loginWithFirebase = async (email, password) => {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase is not configured. Please supply keys in .env');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Fetch user profile from Firestore
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userSnapshot = await getDoc(userDocRef);

  let userData;

  if (userSnapshot.exists()) {
    userData = userSnapshot.data();
  } else {
    // If doc does not exist yet, initialize it
    userData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || email.split('@')[0],
      email: firebaseUser.email,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(userDocRef, userData);
  }

  const token = await firebaseUser.getIdToken();

  return {
    user: userData,
    token
  };
};

/**
 * Sign out from Firebase
 */
export const logoutFromFirebase = async () => {
  if (auth) {
    await signOut(auth);
  }
};

/**
 * Update user profile in Firestore and Auth
 */
export const updateUserProfileInFirebase = async (uid, updates) => {
  if (!isFirebaseConfigured || !db) return null;

  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });

  if (auth?.currentUser && updates.name) {
    await updateFirebaseProfile(auth.currentUser, { displayName: updates.name });
  }

  const updatedSnap = await getDoc(userDocRef);
  return updatedSnap.exists() ? updatedSnap.data() : updates;
};

/**
 * Subscribe to Firebase Auth state changes
 */
export const subscribeToFirebaseAuthState = (callback) => {
  if (!isFirebaseConfigured || !auth) {
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnapshot = await getDoc(userDocRef);
        
        let userData;
        if (userSnapshot.exists()) {
          userData = userSnapshot.data();
        } else {
          userData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Athlete',
            email: firebaseUser.email,
            role: 'user'
          };
        }

        callback({ user: userData, token });
      } catch (err) {
        console.error('Error fetching user auth doc:', err);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

/**
 * Fetch all registered users from Firestore for Super Admin inspection
 */
export const fetchAllUsersFromFirebase = async () => {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const usersColRef = collection(db, 'users');
    const snapshot = await getDocs(usersColRef);
    const list = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        uid: d.id,
        name: data.name || data.displayName || 'Athlete',
        email: data.email || '',
        role: data.role || 'user',
        status: data.status || 'active',
        joined: data.createdAt ? data.createdAt.split('T')[0] : '2026-10-14',
        progressLogs: data.progressLogs || []
      });
    });
    return list;
  } catch (error) {
    console.error('Error fetching all users from Firestore:', error);
    return [];
  }
};
