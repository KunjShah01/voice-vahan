'use server';

/**
 * @fileOverview A conversational AI agent.
 *
 * - conversationalFlow - A function that handles conversational queries.
 * - ConversationalInput - The input type for the conversationalFlow function.
 * - ConversationalOutput - The return type for the conversationalFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConversationalInputSchema = z.object({
  query: z
    .string()
    .describe('The user\'s conversational query.'),
});
export type ConversationalInput = z.infer<typeof ConversationalInputSchema>;

const ConversationalOutputSchema = z.object({
  answer: z
    .string()
    .describe('The AI\'s response to the user\'s query.'),
});
export type ConversationalOutput = z.infer<typeof ConversationalOutputSchema>;

export async function conversationalFlow(
  input: ConversationalInput
): Promise<ConversationalOutput> {
  return conversationalFlowInstance(input);
}

const prompt = ai.definePrompt({
  name: 'conversationalPrompt',
  input: {schema: ConversationalInputSchema},
  output: {schema: ConversationalOutputSchema},
  prompt: `You are a helpful and knowledgeable in-car voice assistant named VoiceVahan.
  You can answer questions on a wide variety of topics.
  The user is speaking to you from their car.
  Keep your answers concise and to the point.
  If you don't know the answer, say so.
  
  User query: {{{query}}}
  `,
});

const conversationalFlowInstance = ai.defineFlow(
  {
    name: 'conversationalFlow',
    inputSchema: ConversationalInputSchema,
    outputSchema: ConversationalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
