export type KycStatus = 'unverified' | 'pending' | 'approved' | 'rejected' | 'new';
export type LoanStatus = 'none' | 'pending' | 'review' | 'approved' | 'rejected';

export interface User {
  id: string;
  fullName?: string;
  documentNumber?: string;
  documentImageUri?: string;
  faceScanImageUri?: string;
  kycStatus: KycStatus;
  kycReason?: string;
  loanAmount?: number;
  loanStatus: LoanStatus;
  loanReason?: string;
  // Fields for loan assessment
  creditScore?: number;
  annualIncome?: number;
  employmentStatus?: 'employed' | 'unemployed' | 'self-employed' | 'student';
}

export interface KycFormData {
  fullName: string;
  documentNumber: string;
}

export interface NewUserFormData {
  fullName: string;
  photoUrl: string;
}
