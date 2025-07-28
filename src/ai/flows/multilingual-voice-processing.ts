// The `use server` directive is necessary here because this code is intended to be run on the server.
'use server';

/**
 * @fileOverview A multilingual voice processing AI agent.
 *
 * - multilingualVoiceProcessing - A function that handles multilingual voice processing.
 * - MultilingualVoiceProcessingInput - The input type for the multilingualVoiceProcessing function.
 * - MultilingualVoiceProcessingOutput - The return type for the multilingualVoiceProcessing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultilingualVoiceProcessingInputSchema = z.object({
  userSpeech: z
    .string()
    .describe(
      'The user speech input, which may contain a mix of Hindi and English (Hinglish).'
    ),
});
export type MultilingualVoiceProcessingInput = z.infer<
  typeof MultilingualVoiceProcessingInputSchema
>;

const MultilingualVoiceProcessingOutputSchema = z.object({
  processedText: z
    .string()
    .describe(
      'The processed text, accurately understanding the user command in a mix of Hindi and English (Hinglish).'
    ),
});
export type MultilingualVoiceProcessingOutput = z.infer<
  typeof MultilingualVoiceProcessingOutputSchema
>;

export async function multilingualVoiceProcessing(
  input: MultilingualVoiceProcessingInput
): Promise<MultilingualVoiceProcessingOutput> {
  return multilingualVoiceProcessingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'multilingualVoiceProcessingPrompt',
  input: {schema: MultilingualVoiceProcessingInputSchema},
  output: {schema: MultilingualVoiceProcessingOutputSchema},
  prompt: `You are a multilingual voice assistant, skilled in understanding a mix of Hindi and English (Hinglish).

  The user will speak to you in a mix of Hindi and English.
  You should accurately understand and respond to the user\'s commands, even with code-switching.

  User Speech: {{{userSpeech}}}
  `, // VERY IMPORTANT: newline at the end.
});

const multilingualVoiceProcessingFlow = ai.defineFlow(
  {
    name: 'multilingualVoiceProcessingFlow',
    inputSchema: MultilingualVoiceProcessingInputSchema,
    outputSchema: MultilingualVoiceProcessingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
