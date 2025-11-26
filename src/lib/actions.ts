'use server';

import { revalidatePath } from 'next/cache';
import { assessLoanEligibility } from '@/ai/flows/loan-eligibility-assessment';
import { addNewUser, findUserByCredentials, getUser, updateUser, getAllUsers } from '@/lib/data';
import type { OnboardUserFormData, User, LoginFormData } from '@/lib/types';


export async function loginUser(credentials: LoginFormData): Promise<User | null> {
    const user = findUserByCredentials(credentials.fullName, credentials.secretKey);
    if (!user) {
        return null;
    }
    // In a real app, we would issue a session token. Here we just return the user.
    return user;
}

export async function getUserById(userId: string): Promise<User | null> {
    const user = getUser(userId);
    return user || null;
}

export async function submitLoanRequest(userId: string, loanAmount: number): Promise<User> {
  const user = getUser(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  updateUser(userId, {
    loanAmount,
    loanStatus: 'pending',
    loanReason: 'Loan application submitted. Pending AI assessment.',
  });

  // Simulate a delay for AI processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const eligibility = await assessLoanEligibility({
      loanAmount,
      creditScore: user.creditScore!,
      annualIncome: user.annualIncome!,
      employmentStatus: user.employmentStatus!,
    });
    
    // AI directly approves or rejects
    const finalStatus = eligibility.isEligible ? 'approved' : 'rejected';
    const finalReason = eligibility.reason;

    return updateUser(userId, {
      loanStatus: finalStatus,
      loanReason: finalReason,
    });
  } catch (error) {
    console.error('Loan Assessment Error:', error);
    return updateUser(userId, {
      loanStatus: 'rejected',
      loanReason: 'An error occurred during AI assessment. Please try again.',
    });
  }
}

export async function onboardNewUser(formData: OnboardUserFormData): Promise<User> {
  // Check if user already exists
  if (findUserByCredentials(formData.fullName, formData.secretKey)) {
    throw new Error('A user with these credentials already exists.');
  }
  const newUser = addNewUser(formData.fullName, formData.secretKey);
  revalidatePath('/admin1333/add-user');
  return newUser;
}

export async function getAllUsersForAdmin() {
    return getAllUsers();
}
