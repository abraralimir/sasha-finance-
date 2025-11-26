'use server';

/**
 * @fileOverview Assesses a user's loan eligibility based on their provided information.
 *
 * - assessLoanEligibility - A function that handles the loan eligibility assessment process.
 * - LoanEligibilityInput - The input type for the assessLoanEligibility function.
 * - LoanEligibilityOutput - The return type for the assessLoanEligibility function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LoanEligibilityInputSchema = z.object({
  loanAmount: z.number().describe('The amount of loan requested by the user.'),
  creditScore: z.number().describe('The credit score of the user.'),
  annualIncome: z.number().describe('The annual income of the user.'),
  employmentStatus: z.string().describe('The employment status of the user.'),
});
export type LoanEligibilityInput = z.infer<typeof LoanEligibilityInputSchema>;

const LoanEligibilityOutputSchema = z.object({
  isEligible: z.boolean().describe('Whether the user is eligible for the loan.'),
  reason: z.string().describe('The reason for the eligibility decision.'),
});
export type LoanEligibilityOutput = z.infer<typeof LoanEligibilityOutputSchema>;

export async function assessLoanEligibility(
  input: LoanEligibilityInput
): Promise<LoanEligibilityOutput> {
  return assessLoanEligibilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'loanEligibilityPrompt',
  input: {schema: LoanEligibilityInputSchema},
  output: {schema: LoanEligibilityOutputSchema},
  prompt: `You are an AI loan assessment agent.

You will assess the user's loan eligibility based on the following information:

Loan Amount: {{{loanAmount}}}
Credit Score: {{{creditScore}}}
Annual Income: {{{annualIncome}}}
Employment Status: {{{employmentStatus}}}

You will make a determination as to whether the user is eligible for the loan or not, and set the isEligible output field appropriately.
Explain the reasoning behind your decision in the reason output field.
`,
});

const assessLoanEligibilityFlow = ai.defineFlow(
  {
    name: 'assessLoanEligibilityFlow',
    inputSchema: LoanEligibilityInputSchema,
    outputSchema: LoanEligibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
