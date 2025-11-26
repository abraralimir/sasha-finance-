import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  getFirestore,
} from 'firebase-admin/firestore';
import { initAdmin } from '@/firebase/admin';
import type { User } from './types';

// In a real app, this would be initialized once and provided via context
const firestore = getFirestore(initAdmin());
const usersCollection = collection(firestore, 'users');

// Helper to get a random item from an array
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const addNewUser = async (
  userId: string,
  email: string,
  fullName: string,
  secretKey: string
): Promise<User> => {
  const newUser: User = {
    id: userId,
    email,
    fullName,
    secretKey,
    kycStatus: 'approved', // Auto-approved since we removed KYC flow
    loanStatus: 'none',
    // Generate random financial data for the demo
    creditScore: Math.floor(Math.random() * (850 - 550 + 1)) + 550, // Score between 550-850
    annualIncome: Math.floor(Math.random() * (250000 - 40000 + 1)) + 40000, // Income between 40k-250k
    employmentStatus: getRandomItem(['employed', 'self-employed', 'student']),
  };
  const userDocRef = doc(usersCollection, userId);
  await setDoc(userDocRef, newUser);
  return newUser;
};

export const findUserByCredentials = async (
  fullName: string,
  secretKey: string
): Promise<User | undefined> => {
  const q = query(
    usersCollection,
    where('fullName', '==', fullName),
    where('secretKey', '==', secretKey)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return undefined;
  }
  
  // Assuming fullName + secretKey is unique, so we take the first result.
  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() } as User;
};

export const getUser = async (userId: string): Promise<User | undefined> => {
  const userDocRef = doc(usersCollection, userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User;
  }
  return undefined;
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<User> => {
  const userDocRef = doc(usersCollection, userId);
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const updatedData = { ...user, ...data };
  await setDoc(userDocRef, updatedData, { merge: true });
  return updatedData;
};

export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};
