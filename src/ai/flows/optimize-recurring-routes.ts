// src/ai/flows/optimize-recurring-routes.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest optimizations to recurring routes.
 *
 * - optimizeRecurringRoutes - A function that suggests optimized routes based on user's recurring trips.
 * - OptimizeRecurringRoutesInput - The input type for the optimizeRecurringRoutes function.
 * - OptimizeRecurringRoutesOutput - The return type for the optimizeRecurringRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeRecurringRoutesInputSchema = z.object({
  recurringRoutes: z.array(
    z.object({
      name: z.string().describe('The name of the route.'),
      waypoints: z.array(z.string().describe('An address on the route.')).describe('The addresses/waypoints of the route.'),
    })
  ).describe('An array of recurring routes, each containing a name and a list of waypoints (addresses).'),
  optimizationCriteria: z.string().describe('Specific criteria for optimization, such as minimizing distance, travel time, or avoiding tolls.'),
});
export type OptimizeRecurringRoutesInput = z.infer<typeof OptimizeRecurringRoutesInputSchema>;

const OptimizeRecurringRoutesOutputSchema = z.object({
  optimizedRoutes: z.array(
    z.object({
      routeName: z.string().describe('The name of the route that was optimized.'),
      originalRoute: z.array(z.string()).describe('Original route waypoints'),
      optimizedWaypoints: z.array(z.string()).describe('The optimized list of waypoints for the route.'),
      optimizationSummary: z.string().describe('A summary of the optimizations made, including reasons and expected benefits.'),
    })
  ).describe('An array of optimized routes, including the optimized waypoints and a summary of the changes.'),
});
export type OptimizeRecurringRoutesOutput = z.infer<typeof OptimizeRecurringRoutesOutputSchema>;

export async function optimizeRecurringRoutes(input: OptimizeRecurringRoutesInput): Promise<OptimizeRecurringRoutesOutput> {
  return optimizeRecurringRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeRecurringRoutesPrompt',
  input: {schema: OptimizeRecurringRoutesInputSchema},
  output: {schema: OptimizeRecurringRoutesOutputSchema},
  prompt: `You are an AI route optimization expert. Given a set of recurring routes and optimization criteria, suggest the most efficient routes.

Here are the recurring routes:
{{#each recurringRoutes}}
  Route Name: {{this.name}}
  Waypoints: {{this.waypoints}}
{{/each}}

Optimization Criteria: {{{optimizationCriteria}}}

Analyze these routes and suggest optimizations based on the provided criteria. Consider factors such as distance, travel time, and potential obstacles.

Return an array of optimized routes, including the optimized waypoints and a summary of the changes.
Make sure the waypoints in the optimizedRoutes object represents addresses only, without any additional context.
Ensure that routeName is only the name of the route, without any additional context.
Make sure to include the originalRoute to show users what the route was before optimization.
`,
});

const optimizeRecurringRoutesFlow = ai.defineFlow(
  {
    name: 'optimizeRecurringRoutesFlow',
    inputSchema: OptimizeRecurringRoutesInputSchema,
    outputSchema: OptimizeRecurringRoutesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

