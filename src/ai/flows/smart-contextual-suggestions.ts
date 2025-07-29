'use server';

/**
 * @fileOverview An AI agent that proactively suggests nearby restaurants or coffee shops based on user context.
 *
 * - getSmartSuggestions - A function that returns smart contextual suggestions.
 * - SmartSuggestionsInput - The input type for the getSmartSuggestions function.
 * - SmartSuggestionsOutput - The return type for the getSmartSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartSuggestionsInputSchema = z.object({
  location: z.string().describe('The current GPS coordinates of the vehicle.'),
  fuelLevel: z.number().describe('The current fuel level of the vehicle (%).'),
  currentTime: z.string().describe('The current time of day (e.g., 13:30).'),
  lastKnownDestination: z
    .string()
    .optional()
    .describe('The last known destination of the vehicle, if any.'),
});

export type SmartSuggestionsInput = z.infer<typeof SmartSuggestionsInputSchema>;

const SmartSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z
        .string()
        .describe(
          'The type of suggestion (e.g., restaurant, coffee shop, gas station).'
        ),
      name: z.string().describe('The name of the suggested place.'),
      location: z.string().describe('The GPS coordinates of the suggested place.'),
      reason: z.string().describe('The reason for the suggestion.'),
    })
  ),
});

export type SmartSuggestionsOutput = z.infer<
  typeof SmartSuggestionsOutputSchema
>;

export async function getSmartSuggestions(
  input: SmartSuggestionsInput
): Promise<SmartSuggestionsOutput> {
  return smartContextualSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartContextualSuggestionsPrompt',
  input: {schema: SmartSuggestionsInputSchema},
  output: {schema: SmartSuggestionsOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an AI assistant in a car that proactively provides smart suggestions to the driver based on their current context.

  It is now {{{currentTime}}}.

  The vehicle's current location is: {{{location}}}.
  The fuel level is: {{{fuelLevel}}}%.
  The last known destination was: {{{lastKnownDestination}}}.

  Based on this information, suggest relevant services to the driver, such as nearby restaurants, coffee shops, or gas stations. Provide a reason for each suggestion.
  If the fuel level is below 20%, suggest gas stations.
  If it's around lunch time (11:30 - 13:30), suggest restaurants.
  If it's around coffee time (07:00 - 09:00 or 14:00 - 16:00), suggest coffee shops.

  Return a JSON object with an array of suggestions, where each suggestion has a type, name, location, and reason.
  `,
});

const smartContextualSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartContextualSuggestionsFlow',
    inputSchema: SmartSuggestionsInputSchema,
    outputSchema: SmartSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
