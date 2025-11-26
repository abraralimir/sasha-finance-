'use server';

import { revalidatePath } from 'next/cache';
import { kycAssessment } from '@/ai/flows/kyc-assessment';
import { assessLoanEligibility } from '@/ai/flows/loan-eligibility-assessment';
import { summarizeUserLoanDetails } from '@/ai/flows/summarize-user-loan-details';
import { addNewUser, getOrCreateUser, getUser, updateUser, getAllUsers } from '@/lib/data';
import type { KycFormData, User, NewUserFormData } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';

const MOCK_USER_ID = 'default_user';

// Function to convert image URL to data URI (simulated)
// In a real app, this would involve fetching the image and base64 encoding it.
const toDataUri = (url: string) => {
  const extension = url.split('.').pop();
  let mimeType = 'image/jpeg';
  if (extension === 'png') mimeType = 'image/png';
  return `data:${mimeType};base64,simulated_base64_data_for_${url}`;
};

export async function getUserData(): Promise<User> {
  return getOrCreateUser(MOCK_USER_ID);
}

export async function submitKyc(formData: KycFormData): Promise<User> {
  const docImage = PlaceHolderImages.find(img => img.id === 'doc-scan');
  const faceImage = PlaceHolderImages.find(img => img.id === 'face-scan');

  if (!docImage || !faceImage) {
    throw new Error('Placeholder images not found');
  }

  updateUser(MOCK_USER_ID, {
    fullName: formData.fullName,
    documentNumber: formData.documentNumber,
    documentImageUri: docImage.imageUrl,
    faceScanImageUri: faceImage.imageUrl,
    kycStatus: 'pending',
    kycReason: 'KYC details submitted. Pending AI verification.',
  });

  // Simulate a delay for AI processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const result = await kycAssessment({
      fullName: formData.fullName,
      documentNumber: formData.documentNumber,
      documentImageUri: toDataUri(docImage.imageUrl),
      faceScanImageUri: toDataUri(faceImage.imageUrl),
    });

    return updateUser(MOCK_USER_ID, {
      kycStatus: result.kycPassed ? 'approved' : 'rejected',
      kycReason: result.reason,
    });
  } catch (error) {
    console.error('KYC Assessment Error:', error);
    return updateUser(MOCK_USER_ID, {
      kycStatus: 'rejected',
      kycReason: 'An error occurred during AI verification. Please try again.',
    });
  }
}

export async function submitLoanRequest(loanAmount: number): Promise<User> {
  const user = getUser(MOCK_USER_ID);
  if (!user || user.kycStatus !== 'approved') {
    throw new Error('User not authorized for loan application.');
  }

  updateUser(MOCK_USER_ID, {
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
    
    // Forcing a review state for demo purposes if eligible
    const finalStatus = eligibility.isEligible ? 'review' : 'rejected';
    const finalReason = eligibility.isEligible ? 'AI assessment complete. Pending final admin review.' : eligibility.reason;

    return updateUser(MOCK_USER_ID, {
      loanStatus: finalStatus,
      loanReason: finalReason,
    });
  } catch (error) {
    console.error('Loan Assessment Error:', error);
    return updateUser(MOCK_USER_ID, {
      loanStatus: 'rejected',
      loanReason: 'An error occurred during AI assessment. Please try again.',
    });
  }
}

export async function getAdminPageData() {
  const users = getAllUsers();
  const summarizedUsers = await Promise.all(
    users.map(async user => {
      try {
        if (!user.fullName || !user.loanAmount) {
          return { ...user, summary: 'User has not applied for a loan.' };
        }
        const summary = await summarizeUserLoanDetails({
          kycDetails: JSON.stringify({
            fullName: user.fullName,
            kycStatus: user.kycStatus,
            kycReason: user.kycReason,
          }),
          loanApplication: JSON.stringify({
            loanAmount: user.loanAmount,
            loanStatus: user.loanStatus,
            loanReason: user.loanReason,
          }),
        });
        return { ...user, summary: summary.summary };
      } catch (error) {
        return { ...user, summary: 'Could not generate summary.' };
      }
    })
  );
  return summarizedUsers;
}

export async function updateLoanStatus(userId: string, status: 'approved' | 'rejected', reason: string) {
  updateUser(userId, { loanStatus: status, loanReason: reason });
  revalidatePath('/admin1333');
  revalidatePath('/');
}

export async function onboardNewUser(formData: NewUserFormData): Promise<User> {
  const newUser = addNewUser(formData.fullName, formData.photoUrl);
  revalidatePath('/admin1333');
  return newUser;
}
