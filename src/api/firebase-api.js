import {initializeApp} from "firebase/app";
import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut} from "firebase/auth";
import {get, getDatabase, off, onValue, ref, remove, set, update} from 'firebase/database';
import {FIREBASE_CONFIG} from '@/config/api';
import {logError} from '@/utils/errorUtils';

/**
 * Firebase initialization and API for authentication and database operations
 */

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth, app };

/**
 * Authentication functions
 */

/**
 * Sign in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User credentials
 */
export const signIn = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    logError(error, 'FirebaseAPI:signIn');
    throw error;
  }
};

/**
 * Register a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User credentials
 */
export const register = async (email, password) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    logError(error, 'FirebaseAPI:register');
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    logError(error, 'FirebaseAPI:logOut');
    throw error;
  }
};

/**
 * Database functions
 */

/**
 * Write (overwrite) data at a given path
 * @param {string} path - Database path
 * @param {Object} data - Data to write
 * @returns {Promise<void>}
 */
export const writeData = async (path, data) => {
  try {
    await set(ref(db, path), data);
  } catch (error) {
    logError(error, `FirebaseAPI:writeData(${path})`);
    throw error;
  }
};

/**
 * Read data from a path once
 * @param {string} path - Database path to read
 * @returns {Promise<Object|null>} Data at path or null if not found
 */
export const readData = async (path) => {
  try {
    const snapshot = await get(ref(db, path));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    logError(error, `FirebaseAPI:readData(${path})`);
    throw error;
  }
};

/**
 * Update data at a given path
 * @param {string} path - Database path
 * @param {Object} data - Data to update
 * @returns {Promise<void>}
 */
export const updateData = async (path, data) => {
  try {
    await update(ref(db, path), data);
  } catch (error) {
    logError(error, `FirebaseAPI:updateData(${path})`);
    throw error;
  }
};

/**
 * Delete data at a given path
 * @param {string} path - Database path
 * @returns {Promise<void>}
 */
export const deleteData = async (path) => {
  try {
    await remove(ref(db, path));
  } catch (error) {
    logError(error, `FirebaseAPI:deleteData(${path})`);
    throw error;
  }
};

/**
 * Subscribe to real-time updates at a path
 * @param {string} path - Database path
 * @param {Function} callback - Function to call with updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToData = (path, callback) => {
  try {
    const dataRef = ref(db, path);
    onValue(dataRef, (snapshot) => {
      callback(snapshot.val());
    });
    
    // Return unsubscribe function
    return () => off(dataRef);
  } catch (error) {
    logError(error, `FirebaseAPI:subscribeToData(${path})`);
    throw error;
  }
};
