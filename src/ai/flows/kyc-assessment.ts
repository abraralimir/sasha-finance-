'use server';

/**
 * @fileOverview Performs KYC assessment using Gemini AI for identity verification.
 *
 * - kycAssessment - A function that initiates the KYC assessment process.
 * - KycAssessmentInput - The input type for the kycAssessment function.
 * - KycAssessmentOutput - The return type for the kycAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KycAssessmentInputSchema = z.object({
  fullName: z.string().describe('The full legal name of the user.'),
  documentNumber: z.string().describe('The document number of the user.'),
  documentImageUri: z
    .string()
    .describe(
      "A photo of the user's document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  faceScanImageUri: z
    .string()
    .describe(
      "A photo of the user for facial recognition, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type KycAssessmentInput = z.infer<typeof KycAssessmentInputSchema>;

const KycAssessmentOutputSchema = z.object({
  kycPassed: z.boolean().describe('Whether the KYC assessment passed or not.'),
  reason: z.string().describe('The reason for the KYC assessment result.'),
});
export type KycAssessmentOutput = z.infer<typeof KycAssessmentOutputSchema>;

export async function kycAssessment(input: KycAssessmentInput): Promise<KycAssessmentOutput> {
  return kycAssessmentFlow(input);
}

const kycAssessmentPrompt = ai.definePrompt({
  name: 'kycAssessmentPrompt',
  input: {schema: KycAssessmentInputSchema},
  output: {schema: KycAssessmentOutputSchema},
  prompt: `You are an expert KYC (Know Your Customer) and fraud detection agent.

You will assess the provided user information, document image, and face scan to determine if the user passes KYC.

Consider the following factors:
- Does the name on the document match the provided full name?
- Does the face in the face scan match the face on the document?
- Is the document valid and not fraudulent?
- Are there any red flags or inconsistencies that indicate potential fraud?

Based on your assessment, set the kycPassed output field to true or false and provide a detailed reason for your decision.

Full Name: {{{fullName}}}
Document Number: {{{documentNumber}}}
Document Image: {{media url=documentImageUri}}
Face Scan: {{media url=faceScanImageUri}}`,
});

const kycAssessmentFlow = ai.defineFlow(
  {
    name: 'kycAssessmentFlow',
    inputSchema: KycAssessmentInputSchema,
    outputSchema: KycAssessmentOutputSchema,
  },
  async input => {
    const {output} = await kycAssessmentPrompt(input);
    return output!;
  }
);
