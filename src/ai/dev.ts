import { config } from 'dotenv';
config();

import '@/ai/flows/kyc-assessment.ts';
import '@/ai/flows/loan-eligibility-assessment.ts';
import '@/ai/flows/summarize-user-loan-details.ts';