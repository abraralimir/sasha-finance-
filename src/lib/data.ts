// This file is intended for server-side data access.
// It is NOT intended for use on the client.
'use server';

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
} from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import type { User } from './types';


// Helper function to initialize Firebase on the server if it's not already.
// This is safe because server actions are isolated.
function getDb() {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  return getFirestore(getApp());
}


// Helper to get a random item from an array
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const addNewUser = async (
  email: string,
  fullName: string,
  secretKey: string
): Promise<User> => {
  const db = getDb();
  const usersCollection = collection(db, 'users');

  // Firestore will auto-generate an ID for the new document
  const userDocRef = doc(usersCollection);

  const newUser: User = {
    id: userDocRef.id,
    email,
    fullName,
    secretKey,
    kycStatus: 'approved',
    loanStatus: 'none',
    creditScore: Math.floor(Math.random() * (850 - 550 + 1)) + 550,
    annualIncome: Math.floor(Math.random() * (250000 - 40000 + 1)) + 40000,
    employmentStatus: getRandomItem(['employed', 'self-employed', 'student']),
  };

  await setDoc(userDocRef, newUser);
  return newUser;
};

export const findUserByCredentials = async (
  fullName: string,
  secretKey: string
): Promise<User | undefined> => {
  const db = getDb();
  const usersCollection = collection(db, 'users');
  
  const q = query(
    usersCollection,
    where('fullName', '==', fullName),
    where('secretKey', '==', secretKey)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return undefined;
  }
  
  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() } as User;
};

export const getUser = async (userId: string): Promise<User | undefined> => {
  const db = getDb();
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User;
  }
  return undefined;
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<User> => {
  const db = getDb();
  const userDocRef = doc(db, 'users', userId);
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const updatedData = { ...user, ...data };
  await setDoc(userDocRef, updatedData, { merge: true });
  return updatedData;
};

export const getAllUsers = async (): Promise<User[]> => {
  const db = getDb();
  const usersCollection = collection(db, 'users');
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};
