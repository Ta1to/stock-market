import { 
  signIn, 
  register, 
  logOut, 
  writeData, 
  readData, 
  updateData, 
  deleteData,
  subscribeToData,
  db
} from '@/api/firebase-api';

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

import { 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  off 
} from 'firebase/database';

import { logError } from '@/utils/errorUtils';

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn()
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn(),
  getDatabase: jest.fn(() => ({}))
}));

jest.mock('@/utils/errorUtils', () => ({
  logError: jest.fn()
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({}))
}));

jest.mock('@/config/api', () => ({
  FIREBASE_CONFIG: {
    apiKey: 'test-api-key'
  }
}));

describe('Firebase API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Functions', () => {
    describe('signIn', () => {
      it('should sign in a user with email and password', async () => {
        const mockUser = { user: { uid: 'test-uid', email: 'test@example.com' } };
        signInWithEmailAndPassword.mockResolvedValue(mockUser);

        const result = await signIn('test@example.com', 'password123');
        
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
        expect(result).toEqual(mockUser);
      });

      it('should handle sign in errors', async () => {
        const error = new Error('Invalid credentials');
        signInWithEmailAndPassword.mockRejectedValue(error);

        await expect(signIn('wrong@example.com', 'badpassword')).rejects.toThrow(error);
        expect(logError).toHaveBeenCalledWith(error, 'FirebaseAPI:signIn');
      });
    });

    describe('register', () => {
      it('should register a new user with email and password', async () => {
        const mockUser = { user: { uid: 'new-uid', email: 'new@example.com' } };
        createUserWithEmailAndPassword.mockResolvedValue(mockUser);

        const result = await register('new@example.com', 'password123');
        
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith({}, 'new@example.com', 'password123');
        expect(result).toEqual(mockUser);
      });

      it('should handle registration errors', async () => {
        const error = new Error('Email already in use');
        createUserWithEmailAndPassword.mockRejectedValue(error);

        await expect(register('existing@example.com', 'password123')).rejects.toThrow(error);
        expect(logError).toHaveBeenCalledWith(error, 'FirebaseAPI:register');
      });
    });

    describe('logOut', () => {
      it('should sign out the current user', async () => {
        signOut.mockResolvedValue(undefined);

        await logOut();
        
        expect(signOut).toHaveBeenCalledWith({});
      });

      it('should handle sign out errors', async () => {
        const error = new Error('Network error');
        signOut.mockRejectedValue(error);

        await expect(logOut()).rejects.toThrow(error);
        expect(logError).toHaveBeenCalledWith(error, 'FirebaseAPI:logOut');
      });
    });
  });

  describe('Database Functions', () => {
    describe('writeData', () => {
      it('should write data to the specified path', async () => {
        const path = 'users/test-uid';
        const data = { name: 'Test User', email: 'test@example.com' };
        ref.mockReturnValue('dbRef');
        set.mockResolvedValue(undefined);

        await writeData(path, data);

        expect(ref).toHaveBeenCalledWith(db, path);
        expect(set).toHaveBeenCalledWith('dbRef', data);
      });

      it('should handle write errors', async () => {
        const path = 'users/test-uid';
        const data = { name: 'Test User' };
        const error = new Error('Permission denied');
        ref.mockReturnValue('dbRef');
        set.mockRejectedValue(error);

        await expect(writeData(path, data)).rejects.toThrow(error);
        expect(logError).toHaveBeenCalledWith(error, `FirebaseAPI:writeData(${path})`);
      });
    });

    describe('readData', () => {
      it('should read data from the specified path', async () => {
        const path = 'users/test-uid';
        const mockData = { name: 'Test User', email: 'test@example.com' };
        ref.mockReturnValue('dbRef');
        get.mockResolvedValue({
          exists: () => true,
          val: () => mockData
        });

        const result = await readData(path);

        expect(ref).toHaveBeenCalledWith(db, path);
        expect(get).toHaveBeenCalledWith('dbRef');
        expect(result).toEqual(mockData);
      });

      it('should return null if data does not exist', async () => {
        const path = 'users/nonexistent';
        ref.mockReturnValue('dbRef');
        get.mockResolvedValue({
          exists: () => false,
          val: () => null
        });

        const result = await readData(path);

        expect(ref).toHaveBeenCalledWith(db, path);
        expect(get).toHaveBeenCalledWith('dbRef');
        expect(result).toBeNull();
      });

      it('should handle read errors', async () => {
        const path = 'users/test-uid';
        const error = new Error('Permission denied');
        ref.mockReturnValue('dbRef');
        get.mockRejectedValue(error);

        await expect(readData(path)).rejects.toThrow(error);
        expect(logError).toHaveBeenCalledWith(error, `FirebaseAPI:readData(${path})`);
      });
    });

    describe('updateData', () => {
      it('should update data at the specified path', async () => {
        const path = 'users/test-uid';
        const data = { name: 'Updated Name' };
        ref.mockReturnValue('dbRef');
        update.mockResolvedValue(undefined);

        await updateData(path, data);

        expect(ref).toHaveBeenCalledWith(db, path);
        expect(update).toHaveBeenCalledWith('dbRef', data);
      });

      it('should handle update errors', async () => {
        const path = 'users/test-uid';
        const data = { name: 'Updated Name' };
        const error = new Error('Permission denied');
        ref.mockReturnValue('dbRef');
        update.mockRejectedValue(error);

        await expect(updateData(path, data)).rejects.toThrow(error);
        expect(logError).toHaveBeenCalledWith(error, `FirebaseAPI:updateData(${path})`);
      });
    });

    describe('deleteData', () => {
      it('should delete data at the specified path', async () => {
        const path = 'users/test-uid';
        ref.mockReturnValue('dbRef');
        remove.mockResolvedValue(undefined);

        await deleteData(path);

        expect(ref).toHaveBeenCalledWith(db, path);
        expect(remove).toHaveBeenCalledWith('dbRef');
      });

      it('should handle delete errors', async () => {
        const path = 'users/test-uid';
        const error = new Error('Permission denied');
        ref.mockReturnValue('dbRef');
        remove.mockRejectedValue(error);

        await expect(deleteData(path)).rejects.toThrow(error);
        expect(logError).toHaveBeenCalledWith(error, `FirebaseAPI:deleteData(${path})`);
      });
    });

    describe('subscribeToData', () => {
      it('should set up a listener for real-time updates', () => {
        const path = 'users/test-uid';
        const callback = jest.fn();
        ref.mockReturnValue('dbRef');

        const unsubscribe = subscribeToData(path, callback);

        expect(ref).toHaveBeenCalledWith(db, path);
        expect(onValue).toHaveBeenCalledWith('dbRef', expect.any(Function));

        // Test callback is invoked with data
        const snapMock = {
          val: () => ({ name: 'Test User' })
        };
        onValue.mock.calls[0][1](snapMock);
        expect(callback).toHaveBeenCalledWith({ name: 'Test User' });

        // Test unsubscribe function
        expect(typeof unsubscribe).toBe('function');
        unsubscribe();
        expect(off).toHaveBeenCalledWith('dbRef');
      });

      it('should handle subscription errors', () => {
        const path = 'users/test-uid';
        const callback = jest.fn();
        const error = new Error('Permission denied');
        ref.mockImplementation(() => {
          throw error;
        });

        expect(() => subscribeToData(path, callback)).toThrow(error);
        expect(logError).toHaveBeenCalledWith(error, `FirebaseAPI:subscribeToData(${path})`);
      });
    });
  });
});