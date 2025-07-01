// src/ai/flows/optimize-recurring-routes.ts
'use server';

/**
 * @fileOverview Ce fichier définit un flux Genkit pour suggérer des optimisations aux itinéraires récurrents.
 *
 * - optimizeRecurringRoutes - Une fonction qui suggère des itinéraires optimisés en fonction des trajets récurrents de l'utilisateur.
 * - OptimizeRecurringRoutesInput - Le type d'entrée pour la fonction optimizeRecurringRoutes.
 * - OptimizeRecurringRoutesOutput - Le type de retour pour la fonction optimizeRecurringRoutes.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeRecurringRoutesInputSchema = z.object({
  recurringRoutes: z.array(
    z.object({
      name: z.string().describe("Le nom de l'itinéraire."),
      waypoints: z.array(z.string().describe("Une adresse sur l'itinéraire.")).describe("Les adresses/points de cheminement de l'itinéraire."),
    })
  ).describe("Un tableau d'itinéraires récurrents, chacun contenant un nom et une liste de points de cheminement (adresses)."),
  optimizationCriteria: z.string().describe("Critères spécifiques d'optimisation, tels que la minimisation de la distance, du temps de trajet ou l'évitement des péages."),
});
export type OptimizeRecurringRoutesInput = z.infer<typeof OptimizeRecurringRoutesInputSchema>;

const OptimizeRecurringRoutesOutputSchema = z.object({
  optimizedRoutes: z.array(
    z.object({
      routeName: z.string().describe("Le nom de l'itinéraire qui a été optimisé."),
      originalRoute: z.array(z.string()).describe("Points de cheminement de l'itinéraire original"),
      optimizedWaypoints: z.array(z.string()).describe("La liste optimisée des points de cheminement pour l'itinéraire."),
      optimizationSummary: z.string().describe("Un résumé des optimisations effectuées, y compris les raisons et les avantages attendus."),
    })
  ).describe("Un tableau d'itinéraires optimisés, comprenant les points de cheminement optimisés et un résumé des modifications."),
});
export type OptimizeRecurringRoutesOutput = z.infer<typeof OptimizeRecurringRoutesOutputSchema>;

export async function optimizeRecurringRoutes(input: OptimizeRecurringRoutesInput): Promise<OptimizeRecurringRoutesOutput> {
  return optimizeRecurringRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeRecurringRoutesPrompt',
  input: {schema: OptimizeRecurringRoutesInputSchema},
  output: {schema: OptimizeRecurringRoutesOutputSchema},
  prompt: `Vous êtes un expert en optimisation d'itinéraires IA. Étant donné un ensemble d'itinéraires récurrents et des critères d'optimisation, suggérez les itinéraires les plus efficaces.

Voici les itinéraires récurrents :
{{#each recurringRoutes}}
  Nom de l'itinéraire : {{this.name}}
  Points de cheminement : {{this.waypoints}}
{{/each}}

Critères d'optimisation : {{{optimizationCriteria}}}

Analysez ces itinéraires et suggérez des optimisations en fonction des critères fournis. Tenez compte de facteurs tels que la distance, le temps de trajet et les obstacles potentiels.

Renvoyez un tableau d'itinéraires optimisés, y compris les points de cheminement optimisés et un résumé des modifications.
Assurez-vous que les points de cheminement dans l'objet optimizedRoutes représentent uniquement des adresses, sans aucun contexte supplémentaire.
Assurez-vous que routeName est uniquement le nom de l'itinéraire, sans aucun contexte supplémentaire.
Assurez-vous d'inclure originalRoute pour montrer aux utilisateurs quel était l'itinéraire avant l'optimisation.
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
