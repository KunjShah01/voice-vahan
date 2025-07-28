'use server';

/**
 * @fileOverview An AI agent that plans road trips with multiple stops.
 *
 * - planTrip - A function that handles the trip planning process.
 * - TripPlannerInput - The input type for the planTrip function.
 * - TripPlannerOutput - The return type for the planTrip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TripPlannerInputSchema = z.object({
  query: z
    .string()
    .describe(
      'The user\'s request for a trip plan, including destination and any desired stops (e.g., "Plan a trip to Agra with a stop for lunch").'
    ),
});
export type TripPlannerInput = z.infer<typeof TripPlannerInputSchema>;

const TripPlannerOutputSchema = z.object({
  plan: z.array(
    z.object({
      location: z.string().describe('The name of the location or stop.'),
      type: z
        .string()
        .describe(
          'The type of stop (e.g., "Origin", "Stopover", "Destination").'
        ),
      description: z.string().describe('A brief description of this leg of the journey.'),
    })
  ),
});
export type TripPlannerOutput = z.infer<typeof TripPlannerOutputSchema>;

export async function planTrip(
  input: TripPlannerInput
): Promise<TripPlannerOutput> {
  return tripPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tripPlannerPrompt',
  input: {schema: TripPlannerInputSchema},
  output: {schema: TripPlannerOutputSchema},
  prompt: `You are a road trip planning assistant. Based on the user's query, create a multi-stop itinerary.
  The first stop should always be the origin, "New Delhi".
  The final stop should be the user's requested destination.
  Include any intermediate stops mentioned by the user.

  User Query: {{{query}}}

  Generate a plan as an array of stops. For each stop, provide the location, type, and a brief description.`,
});

const tripPlannerFlow = ai.defineFlow(
  {
    name: 'tripPlannerFlow',
    inputSchema: TripPlannerInputSchema,
    outputSchema: TripPlannerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
