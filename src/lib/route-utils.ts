import { calculateDistance } from '@/ai/flows/calculate-distance-flow';
import { RecurringRoute } from '@/types';

export async function calculateTotalDistanceForRoute(waypoints: string[]): Promise<number> {
  if (waypoints.length < 2) {
    return 0;
  }

  const distancePromises: Promise<{ distance: number }>[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const startAddress = waypoints[i];
    const endAddress = waypoints[i + 1];
    if (startAddress && endAddress) {
      distancePromises.push(calculateDistance({ startAddress, endAddress }));
    }
  }

  if (distancePromises.length === 0) {
    return 0;
  }

  try {
    const results = await Promise.all(distancePromises);
    const totalDistance = results.reduce((acc, result) => acc + result.distance, 0);
    return parseFloat(totalDistance.toFixed(1));
  } catch (error) {
      console.error("Erreur lors du calcul de la distance totale de l'itinéraire", error);
      throw new Error("Impossible de calculer la distance pour l'un des segments de l'itinéraire.");
  }
}
