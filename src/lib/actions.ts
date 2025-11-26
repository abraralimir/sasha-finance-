'use server';

import { revalidatePath } from 'next/cache';
import { assessLoanEligibility } from '@/ai/flows/loan-eligibility-assessment';
import type { LoanApplicationData } from '@/lib/types';
import { createLoanApplication } from '@/lib/data';


export async function submitLoanApplication(
  data: LoanApplicationData
): Promise<{ eligibility: { isEligible: boolean; reason: string }, applicationId: string }> {

  // First, get the AI's assessment
  const eligibility = await assessLoanEligibility({
    loanAmount: data.loanAmount,
    creditScore: data.creditScore,
    annualIncome: data.annualIncome,
    employmentStatus: data.employmentStatus,
  });

  // Then, save the application data along with the AI's decision
  const applicationId = await createLoanApplication({
      ...data,
      loanStatus: eligibility.isEligible ? 'approved' : 'rejected',
      loanReason: eligibility.reason
  });

  // Revalidate paths to update any admin dashboards if they exist
  revalidatePath('/');
  revalidatePath('/admin1333');

  return { eligibility, applicationId };
}

// The following functions are no longer needed in the simplified flow
// export async function loginUser(credentials: LoginFormData): Promise<User | null> {
//     const user = await findUserByCredentials(credentials.fullName, credentials.secretKey);
//     if (!user) {
//         return null;
//     }
//     return user;
// }

// export async function getUserById(userId: string): Promise<User | null> {
//     const user = await getUser(userId);
//     return user || null;
// }


// export async function onboardNewUser(formData: OnboardUserFormData): Promise<User> {
//   const email = `${formData.fullName.replace(/\s+/g, '.').toLowerCase()}-${Date.now()}@aurum.fake`;
//   const newUser = await addNewUser(email, formData.fullName, formData.secretKey);
//   revalidatePath('/admin1333');
//   revalidatePath('/admin1333/add-user');
//   revalidatePath('/');
//   return newUser;
// }

// export async function getAllUsersForAdmin() {
//     return getAllUsers();
// }
