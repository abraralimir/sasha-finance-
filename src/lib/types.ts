export type KycStatus = 'unverified' | 'pending' | 'approved' | 'rejected' | 'new';
export type LoanStatus = 'none' | 'pending' | 'review' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  fullName: string;
  // secretKey has been removed
  kycStatus: KycStatus;
  loanAmount?: number;
  loanStatus: LoanStatus;
  loanReason?: string;
  // Fields for loan assessment
  creditScore?: number;
  annualIncome?: number;
  employmentStatus?: 'employed' | 'unemployed' | 'self-employed' | 'student';
}

// This is no longer needed
// export interface OnboardUserFormData {
//   fullName: string;
//   secretKey: string;
// }

export interface LoanApplicationData {
    fullName: string;
    loanType: 'personal' | 'property';
    loanAmount: number;
    loanTerm: number;
    creditScore: number;
    annualIncome: number;
    employmentStatus: 'employed' | 'unemployed' | 'self-employed' | 'student';
    propertyValue?: number;
}

export interface BankDetails {
    accountNumber: string;
    ifscCode: string;
}

// This is no longer needed
// export interface LoginFormData {
//   fullName: string;
//   secretKey: string;
// }
