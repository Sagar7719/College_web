import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';

export const loginAdminUser = async (email: string, pass: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
};

export const logoutAdminUser = async (): Promise<void> => {
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getActiveAdminUser = (): User | null => {
  return auth.currentUser;
};
