import { writeData, readData, updateData, deleteData } from '@/services/database';
import { ref, set, get, update, remove } from 'firebase/database';
import { db } from '@/api/firebase-api';

// Mock Firebase modules
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('@/api/firebase-api', () => ({
  db: {}
}));

describe('Database Service', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('writeData', () => {
    it('should write data to the specified path', async () => {
      // Setup
      const path = 'users/test-user-id';
      const data = { name: 'Test User', email: 'test@example.com' };
      ref.mockReturnValue('dbRef');
      set.mockResolvedValue(undefined);

      // Execute
      await writeData(path, data);

      // Verify
      expect(ref).toHaveBeenCalledWith(db, path);
      expect(set).toHaveBeenCalledWith('dbRef', data);
      expect(console.log).toHaveBeenCalledWith(`Data written to ${path}`);
    });

    it('should handle errors when writing data', async () => {
      // Setup
      const path = 'users/test-user-id';
      const data = { name: 'Test User', email: 'test@example.com' };
      const error = new Error('Database write error');
      ref.mockReturnValue('dbRef');
      set.mockRejectedValue(error);

      // Execute
      await writeData(path, data);

      // Verify
      expect(ref).toHaveBeenCalledWith(db, path);
      expect(set).toHaveBeenCalledWith('dbRef', data);
      expect(console.error).toHaveBeenCalledWith(`Error writing data to ${path}:`, error);
    });
  });

  describe('readData', () => {
    it('should read data from the specified path', async () => {
      // Setup
      const path = 'users/test-user-id';
      const mockData = { name: 'Test User', email: 'test@example.com' };
      ref.mockReturnValue('dbRef');
      get.mockResolvedValue({
        exists: () => true,
        val: () => mockData
      });

      // Execute
      const result = await readData(path);

      // Verify
      expect(ref).toHaveBeenCalledWith(db, path);
      expect(get).toHaveBeenCalledWith('dbRef');
      expect(result).toEqual(mockData);
    });

    it('should return null if no data exists', async () => {
      // Setup
      const path = 'users/non-existent-user';
      ref.mockReturnValue('dbRef');
      get.mockResolvedValue({
        exists: () => false,
        val: () => null
      });

      // Execute
      const result = await readData(path);

      // Verify
      expect(ref).toHaveBeenCalledWith(db, path);
      expect(get).toHaveBeenCalledWith('dbRef');
      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith(`No data available at ${path}`);
    });

    it('should throw an error when reading data fails', async () => {
      // Setup
      const path = 'users/test-user-id';
      const error = new Error('Database read error');
      ref.mockReturnValue('dbRef');
      get.mockRejectedValue(error);

      // Execute & Verify
      await expect(readData(path)).rejects.toThrow(error);
      expect(ref).toHaveBeenCalledWith(db, path);
      expect(get).toHaveBeenCalledWith('dbRef');
      expect(console.error).toHaveBeenCalledWith(`Error reading data from ${path}:`, error);
    });
  });

  describe('updateData', () => {
    it('should update data at the specified path', async () => {
      // Setup
      const path = 'users/test-user-id';
      const data = { name: 'Updated User' };
      ref.mockReturnValue('dbRef');
      update.mockResolvedValue(undefined);

      // Execute
      await updateData(path, data);

      // Verify
      expect(ref).toHaveBeenCalledWith(db, path);
      expect(update).toHaveBeenCalledWith('dbRef', data);
      expect(console.log).toHaveBeenCalledWith(`Data updated at ${path}`);
    });

    it('should handle errors when updating data', async () => {
      // Setup
      const path = 'users/test-user-id';
      const data = { name: 'Updated User' };
      const error = new Error('Database update error');
      ref.mockReturnValue('dbRef');
      update.mockRejectedValue(error);

      // Execute
      await updateData(path, data);

      // Verify
      expect(ref).toHaveBeenCalledWith(db, path);
      expect(update).toHaveBeenCalledWith('dbRef', data);
      expect(console.error).toHaveBeenCalledWith(`Error updating data at ${path}:`, error);
    });
  });

  describe('deleteData', () => {
    it('should delete data from the specified path', async () => {
      // Setup
      const path = 'users/test-user-id';
      ref.mockReturnValue('dbRef');
      remove.mockResolvedValue(undefined);

      // Execute
      await deleteData(path);

      // Verify
      expect(ref).toHaveBeenCalledWith(db, path);
      expect(remove).toHaveBeenCalledWith('dbRef');
      expect(console.log).toHaveBeenCalledWith(`Data deleted from ${path}`);
    });

    it('should handle errors when deleting data', async () => {
      // Setup
      const path = 'users/test-user-id';
      const error = new Error('Database delete error');
      ref.mockReturnValue('dbRef');
      remove.mockRejectedValue(error);

      // Execute
      await deleteData(path);

      // Verify
      expect(ref).toHaveBeenCalledWith(db, path);
      expect(remove).toHaveBeenCalledWith('dbRef');
      expect(console.error).toHaveBeenCalledWith(`Error deleting data from ${path}:`, error);
    });
  });
});