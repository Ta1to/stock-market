import { db } from "../api/firebase";
import { ref, set, get, update, remove } from "firebase/database";

// Store data in the RealTime Database
export const writeData = async (path, data) => {
  try {
    await set(ref(db, path), data);
    console.log(`Data written to ${path}`);
  } catch (error) {
    console.error(`Error writing data to ${path}:`, error);
  }
};

// Read data from the Realtime Database
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

// Update data from the Realtime Database
export const updateData = async (path, data) => {
  try {
    await update(ref(db, path), data);
    console.log(`Data updated at ${path}`);
  } catch (error) {
    console.error(`Error updating data at ${path}:`, error);
  }
};

// Delete data from the Realtime Database
export const deleteData = async (path) => {
  try {
    await remove(ref(db, path));
    console.log(`Data deleted from ${path}`);
  } catch (error) {
    console.error(`Error deleting data from ${path}:`, error);
  }
};