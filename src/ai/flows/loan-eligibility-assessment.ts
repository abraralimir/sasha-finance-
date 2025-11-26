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
  loanType: z.enum(['personal', 'property']).describe('The type of loan requested.'),
  loanAmount: z.number().describe('The amount of loan requested by the user.'),
  creditScore: z.number().describe('The credit score of the user.'),
  annualIncome: z.number().describe('The annual income of the user.'),
  employmentStatus: z.string().describe('The employment status of the user.'),
  propertyValue: z.number().optional().describe('The value of the property for a property loan.'),
});
export type LoanEligibilityInput = z.infer<typeof LoanEligibilityInputSchema>;

const LoanEligibilityOutputSchema = z.object({
  isEligible: z.boolean().describe('Whether the user is eligible for the loan.'),
  reason: z.string().describe('The reason for the eligibility decision.'),
  interestRate: z.number().optional().describe('The approved interest rate for the loan, between 6 and 12 percent. This should only be provided if the user is eligible.'),
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
  prompt: `You are an AI loan assessment agent for a luxury finance company called Aurum.

You will assess the user's loan eligibility based on the following information:

Loan Type: {{{loanType}}}
Loan Amount: {{{loanAmount}}}
Credit Score: {{{creditScore}}}
Annual Income: {{{annualIncome}}}
Employment Status: {{{employmentStatus}}}

{{#if propertyValue}}
Property Value: {{{propertyValue}}}
{{/if}}

- For a 'property' loan, the loan amount should not exceed 80% of the property value.
- For a 'personal' loan, the loan amount should generally not exceed 50% of the annual income.
- A credit score below 600 is a high risk.
- 'unemployed' status is very high risk unless income is substantial.

You will make a determination as to whether the user is eligible for the loan or not, and set the isEligible output field appropriately.
Explain the reasoning behind your decision in the reason output field.

If the user IS eligible, you MUST determine an annual interest rate for the loan between 6% and 12%.
- A lower risk profile (e.g., high credit score, high income relative to loan amount) should result in a lower interest rate (closer to 6%).
- A higher risk profile (e.g., lower credit score, 'self-employed') should result in a higher interest rate (closer to 12%).
- If you approve the loan, you must set the interestRate field.
- If you reject the loan, do not provide an interestRate.
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
