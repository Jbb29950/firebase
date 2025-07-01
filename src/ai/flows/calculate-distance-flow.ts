'use server';
/**
 * @fileOverview Un flux Genkit pour calculer la distance entre deux adresses en utilisant OpenCage et OpenRouteService.
 *
 * - calculateDistance - Une fonction qui calcule la distance.
 * - CalculateDistanceInput - Le type d'entrée pour la fonction calculateDistance.
 * - CalculateDistanceOutput - Le type de retour pour la fonction calculateDistance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';

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

// Fonction pour obtenir les coordonnées à partir d'une adresse en utilisant OpenCage
async function getCoordinates(address: string, apiKey: string) {
  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: address,
        key: apiKey,
        limit: 1,
        language: 'fr',
        countrycode: 'fr',
      },
    });

    if (response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry;
      return { longitude: lng, latitude: lat };
    }
    throw new Error(`Impossible de géocoder l'adresse : ${address}`);
  } catch (error) {
    console.error(`Erreur de géocodage pour ${address}:`, error);
    throw new Error(`Une erreur est survenue lors du géocodage de l'adresse : ${address}`);
  }
}

const calculateDistanceFlow = ai.defineFlow(
  {
    name: 'calculateDistanceFlow',
    inputSchema: CalculateDistanceInputSchema,
    outputSchema: CalculateDistanceOutputSchema,
  },
  async (input) => {
    const openCageApiKey = process.env.OPENCAGE_API_KEY;
    const openRouteServiceApiKey = process.env.OPENROUTESERVICE_API_KEY;

    if (!openCageApiKey) {
      throw new Error("La clé d'API OpenCage n'est pas configurée. Veuillez l'ajouter à votre fichier .env.");
    }
    if (!openRouteServiceApiKey) {
      throw new Error("La clé d'API OpenRouteService n'est pas configurée. Veuillez l'ajouter à votre fichier .env.");
    }

    try {
      // Obtenir les coordonnées pour les adresses de départ et d'arrivée
      const startCoords = await getCoordinates(input.startAddress, openCageApiKey);
      const endCoords = await getCoordinates(input.endAddress, openCageApiKey);

      // Calculer l'itinéraire en utilisant OpenRouteService
      const orsResponse = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car',
        {
          coordinates: [
            [startCoords.longitude, startCoords.latitude],
            [endCoords.longitude, endCoords.latitude],
          ],
        },
        {
          headers: {
            'Authorization': openRouteServiceApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (orsResponse.data.routes && orsResponse.data.routes.length > 0) {
        const distanceInMeters = orsResponse.data.routes[0].summary.distance;
        const distanceInKm = distanceInMeters / 1000;
        return {
          distance: parseFloat(distanceInKm.toFixed(1)),
        };
      }

      throw new Error("Impossible de calculer l'itinéraire avec OpenRouteService.");

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Erreur de l'API:", error.response.data);
        throw new Error(`Erreur de l'API: ${error.response.status} ${error.response.statusText}`);
      }
      console.error("Erreur inattendue lors du calcul de la distance:", error);
      if (error instanceof Error) {
        throw new Error(`Une erreur inattendue est survenue : ${error.message}`);
      }
      throw new Error("Une erreur inattendue est survenue lors du calcul de la distance.");
    }
  }
);
