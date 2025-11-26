'use server';

import { revalidatePath } from 'next/cache';
import { assessLoanEligibility } from '@/ai/flows/loan-eligibility-assessment';
import { addNewUser, findUserByCredentials, getUser, updateUser, getAllUsers } from '@/lib/data';
import type { OnboardUserFormData, User, LoginFormData } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/firebase/admin';

// Initialize Firebase Admin for server-side actions
const adminApp = initAdmin();
const adminAuth = getAuth(adminApp);


export async function loginUser(credentials: LoginFormData): Promise<User | null> {
    const user = await findUserByCredentials(credentials.fullName, credentials.secretKey);
    if (!user) {
        return null;
    }
    // In a real app, we would issue a session token. Here we just return the user.
    return user;
}

export async function getUserById(userId: string): Promise<User | null> {
    const user = await getUser(userId);
    return user || null;
}

export async function submitLoanRequest(userId: string, loanAmount: number): Promise<User> {
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  await updateUser(userId, {
    loanAmount,
    loanStatus: 'pending',
    loanReason: 'Loan application submitted. Pending AI assessment.',
  });

  revalidatePath('/'); // Revalidate to show updated status

  // Simulate a delay for AI processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    if (!user.creditScore || !user.annualIncome || !user.employmentStatus) {
        throw new Error('User data is incomplete for loan assessment.');
    }
    
    const eligibility = await assessLoanEligibility({
      loanAmount,
      creditScore: user.creditScore,
      annualIncome: user.annualIncome,
      employmentStatus: user.employmentStatus,
    });
    
    // AI directly approves or rejects
    const finalStatus = eligibility.isEligible ? 'approved' : 'rejected';
    const finalReason = eligibility.reason;

    const updatedUser = await updateUser(userId, {
      loanStatus: finalStatus,
      loanReason: finalReason,
    });
    revalidatePath('/');
    revalidatePath('/admin1333');
    return updatedUser;

  } catch (error) {
    console.error('Loan Assessment Error:', error);
    const updatedUser = await updateUser(userId, {
      loanStatus: 'rejected',
      loanReason: 'An error occurred during AI assessment. Please try again.',
    });
    revalidatePath('/');
    revalidatePath('/admin1333');
    return updatedUser;
  }
}

export async function onboardNewUser(formData: OnboardUserFormData): Promise<User> {
  // Check if user already exists
  const existingUser = await findUserByCredentials(formData.fullName, formData.secretKey);
  if (existingUser) {
    throw new Error('A user with these credentials already exists.');
  }

  try {
    // Generate a unique email, create the user in Firebase Auth
    const email = `${formData.fullName.replace(/\s+/g, '.').toLowerCase()}-${Date.now()}@aurum.fake`; 
    
    // This part runs on the server using the Admin SDK
    const userRecord = await adminAuth.createUser({
      email: email,
      password: formData.secretKey,
      displayName: formData.fullName,
    });
    
    const newUser = await addNewUser(userRecord.uid, email, formData.fullName, formData.secretKey);
    
    revalidatePath('/admin1333');
    revalidatePath('/admin1333/add-user');
    revalidatePath('/');

    return newUser;
  } catch (error) {
    console.error("Error onboarding new user:", error);
    // Provide a more specific error message if possible
    if (error instanceof Error && (error as any).code === 'auth/email-already-exists') {
        throw new Error('This user might already be registered. Please try a different name.');
    }
    throw new Error("Failed to create a new user account.");
  }
}

export async function getAllUsersForAdmin() {
    return getAllUsers();
}
