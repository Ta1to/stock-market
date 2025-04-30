import { db } from "@/api/firebase-api";
import { ref, set, get, update, remove } from "firebase/database";

/**
 * Firebase Realtime Database service
 * Provides CRUD operations for interacting with the database
 */

/**
 * Stores data in the Firebase Realtime Database
 * @param {string} path - Database path where data should be stored
 * @param {object} data - Data to store
 * @returns {Promise<void>}
 */
export const writeData = async (path, data) => {
  try {
    await set(ref(db, path), data);
    console.log(`Data written to ${path}`);
  } catch (error) {
    console.error(`Error writing data to ${path}:`, error);
  }
};

/**
 * Reads data from the Firebase Realtime Database
 * @param {string} path - Database path to read from
 * @returns {Promise<object|null>} Data object or null if not found
 */
export const readData = async (path) => {
  try {
    const snapshot = await get(ref(db, path));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log(`No data available at ${path}`);
      return null;
    }
  } catch (error) {
    console.error(`Error reading data from ${path}:`, error);
    throw error;
  }
};

/**
 * Updates data in the Firebase Realtime Database
 * Only updates the specified fields, preserving the rest
 * @param {string} path - Database path to update
 * @param {object} data - Object containing the fields to update
 * @returns {Promise<void>}
 */
export const updateData = async (path, data) => {
  try {
    await update(ref(db, path), data);
    console.log(`Data updated at ${path}`);
  } catch (error) {
    console.error(`Error updating data at ${path}:`, error);
  }
};

/**
 * Deletes data from the Firebase Realtime Database
 * @param {string} path - Database path to delete
 * @returns {Promise<void>}
 */
export const deleteData = async (path) => {
  try {
    await remove(ref(db, path));
    console.log(`Data deleted from ${path}`);
  } catch (error) {
    console.error(`Error deleting data from ${path}:`, error);
  }
};