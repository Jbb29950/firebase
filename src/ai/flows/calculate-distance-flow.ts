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
import {Client, Status} from '@googlemaps/google-maps-services-js';

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

const mapsClient = new Client({});

const calculateDistanceFlow = ai.defineFlow(
  {
    name: 'calculateDistanceFlow',
    inputSchema: CalculateDistanceInputSchema,
    outputSchema: CalculateDistanceOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("La clé d'API Google Maps n'est pas configurée. Veuillez l'ajouter à votre fichier .env.");
    }

    try {
      const response = await mapsClient.directions({
        params: {
          origin: input.startAddress,
          destination: input.endAddress,
          key: apiKey,
        },
      });

      if (response.data.status === Status.OK && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];
        if (leg) {
          const distanceInMeters = leg.distance.value;
          const distanceInKm = distanceInMeters / 1000;
          return {
            distance: parseFloat(distanceInKm.toFixed(1)),
          };
        }
      }
      
      console.error('Erreur de l\'API Directions :', response.data.error_message || response.data.status);
      throw new Error(`Impossible de calculer l'itinéraire. Statut : ${response.data.status}`);

    } catch (error) {
      console.error("Erreur lors de l'appel à l'API Google Maps", error);
      if (error instanceof Error) {
        throw new Error(`Une erreur inattendue est survenue lors du calcul de la distance: ${error.message}`);
      }
      throw new Error("Une erreur inattendue est survenue lors du calcul de la distance.");
    }
  }
);
