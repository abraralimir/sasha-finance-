// This file is intended for server-side data access.
// It is NOT intended for use on the client.
'use server';

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
} from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import type { User, LoanApplicationData } from './types';


// Helper function to initialize Firebase on the server if it's not already.
// This is safe because server actions are isolated.
function getDb() {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  return getFirestore(getApp());
}


export const createLoanApplication = async (
  applicationData: LoanApplicationData & { loanStatus: 'approved' | 'rejected', loanReason: string }
): Promise<string> => {
  const db = getDb();
  const applicationsCollection = collection(db, 'loanApplications');

  // Firestore will auto-generate an ID for the new document
  const appDocRef = doc(applicationsCollection);

  const newApplication = {
    id: appDocRef.id,
    ...applicationData,
    createdAt: new Date().toISOString(),
  };

  await setDoc(appDocRef, newApplication);
  return appDocRef.id;
};


export const getAllApplications = async (): Promise<(LoanApplicationData & {id: string})[]> => {
  const db = getDb();
  const appsCollection = collection(db, 'loanApplications');
  const q = query(appsCollection);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as (LoanApplicationData & {id: string})));
};

// No longer needed functions
// export const findUserByCredentials = async (
//   fullName: string,
//   secretKey: string
// ): Promise<User | undefined> => { ... };
// export const getUser = async (userId: string): Promise<User | undefined> => { ... };
// export const updateUser = async (userId: string, data: Partial<User>): Promise<User> => { ... };
