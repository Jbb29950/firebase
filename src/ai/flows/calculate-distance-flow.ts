'use server';
/**
 * @fileOverview Un flux Genkit pour calculer la distance entre deux adresses.
 *
 * - calculateDistance - Une fonction qui calcule la distance.
 * - CalculateDistanceInput - Le type d'entrée pour la fonction calculateDistance.
 * - CalculateDistanceOutput - Le type de retour pour la fonction calculateDistance.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateDistanceInputSchema = z.object({
  startAddress: z.string().describe("L'adresse de départ."),
  endAddress: z.string().describe("L'adresse d'arrivée."),
});
export type CalculateDistanceInput = z.infer<typeof CalculateDistanceInputSchema>;

const CalculateDistanceOutputSchema = z.object({
  distance: z.number().describe("La distance calculée en kilomètres."),
});
export type CalculateDistanceOutput = z.infer<typeof CalculateDistanceOutputSchema>;

export async function calculateDistance(input: CalculateDistanceInput): Promise<CalculateDistanceOutput> {
  return calculateDistanceFlow(input);
}

// REMARQUE : Il s'agit d'une implémentation fictive. Dans une application réelle, vous utiliseriez
// un service comme l'API Google Maps Directions pour calculer la
// distance réelle entre les deux adresses.
const calculateDistanceFlow = ai.defineFlow(
  {
    name: 'calculateDistanceFlow',
    inputSchema: CalculateDistanceInputSchema,
    outputSchema: CalculateDistanceOutputSchema,
  },
  async (input) => {
    console.log(`Calcul de la distance entre ${input.startAddress} et ${input.endAddress}`);
    
    // Simuler un appel API et retourner une distance aléatoire à des fins de démonstration.
    const randomDistance = Math.random() * (50 - 5) + 5; // Distance aléatoire entre 5 et 50 km
    
    return {
      distance: parseFloat(randomDistance.toFixed(1)),
    };
  }
);
