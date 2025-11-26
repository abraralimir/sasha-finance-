'use server';

/**
 * @fileOverview Summarizes user loan application and KYC details for admin review.
 *
 * - summarizeUserLoanDetails - A function that summarizes the user's loan and KYC information.
 * - SummarizeUserLoanDetailsInput - The input type for the summarizeUserLoanDetails function.
 * - SummarizeUserLoanDetailsOutput - The return type for the summarizeUserLoanDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUserLoanDetailsInputSchema = z.object({
  kycDetails: z.string().describe('The user KYC details in JSON string format.'),
  loanApplication: z.string().describe('The user loan application details in JSON string format.'),
});
export type SummarizeUserLoanDetailsInput = z.infer<typeof SummarizeUserLoanDetailsInputSchema>;

const SummarizeUserLoanDetailsOutputSchema = z.object({
  summary: z.string().describe('A summary of the user loan application and KYC details.'),
});
export type SummarizeUserLoanDetailsOutput = z.infer<typeof SummarizeUserLoanDetailsOutputSchema>;

export async function summarizeUserLoanDetails(
  input: SummarizeUserLoanDetailsInput
): Promise<SummarizeUserLoanDetailsOutput> {
  return summarizeUserLoanDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeUserLoanDetailsPrompt',
  input: {schema: SummarizeUserLoanDetailsInputSchema},
  output: {schema: SummarizeUserLoanDetailsOutputSchema},
  prompt: `You are an AI assistant that summarizes user loan applications and KYC details for an administrator to review.

  Summarize the following information into a concise summary that highlights key details for the admin to make a decision on whether to approve the loan.

  KYC Details: {{{kycDetails}}}
  Loan Application: {{{loanApplication}}}
  `,
});

const summarizeUserLoanDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeUserLoanDetailsFlow',
    inputSchema: SummarizeUserLoanDetailsInputSchema,
    outputSchema: SummarizeUserLoanDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
