"use client";

import { useState, useEffect } from 'react';
import { DailyTrip, RecurringRoute } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { AppHeader } from '@/components/header';
import { DailyTrips } from '@/components/daily-trips';
import { RecurringRoutes } from '@/components/recurring-routes';
import { Separator } from '@/components/ui/separator';
import { calculateTotalDistanceForRoute } from '@/lib/route-utils';

const initialRecurringRoutes: RecurringRoute[] = [
    {
        id: '1',
        name: 'Trajet du matin',
        waypoints: ['123 Rue Principale, Anytown, FR', '456 Avenue du Chêne, Work City, FR'],
    },
    {
        id: '2',
        name: 'Retour du soir',
        waypoints: ['456 Avenue du Chêne, Work City, FR', '123 Rue Principale, Anytown, FR'],
    },
    {
        id: '3',
        name: 'Courses du week-end',
        waypoints: ['Maison', 'Épicerie', 'Bureau de poste', 'Quincaillerie', 'Maison'],
    }
];

export default function Home() {
  const [dailyTrips, setDailyTrips] = useState<DailyTrip[]>([]);
  const [recurringRoutes, setRecurringRoutes] = useLocalStorage<RecurringRoute[]>(
    'recurringRoutes',
    initialRecurringRoutes
  );

  const routesWithoutDistanceIds = JSON.stringify(
    recurringRoutes.filter(r => typeof r.distance !== 'number' && r.waypoints.length >= 2).map(r => r.id)
  );

  useEffect(() => {
    const calculateMissingDistances = async () => {
        const routesToUpdate: RecurringRoute[] = JSON.parse(routesWithoutDistanceIds)
            .map((id: string) => recurringRoutes.find(r => r.id === id))
            .filter(Boolean);

        if (routesToUpdate.length === 0) return;

        const calculatedRoutesPromises = routesToUpdate.map(async (route) => {
            try {
                const distance = await calculateTotalDistanceForRoute(route.waypoints);
                return { ...route, distance };
            } catch (error) {
                console.error(`Impossible de calculer la distance pour l'itinéraire: ${route.name}`, error);
                return route;
            }
        });

        const newlyCalculatedRoutes = await Promise.all(calculatedRoutesPromises);
        const calculatedMap = new Map(newlyCalculatedRoutes.map(r => [r.id, r]));

        setRecurringRoutes(prevRoutes =>
            prevRoutes.map(r => calculatedMap.get(r.id) || r)
        );
    };

    calculateMissingDistances();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routesWithoutDistanceIds, setRecurringRoutes]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto py-8 flex-grow">
        <div className="space-y-8">
          <DailyTrips dailyTrips={dailyTrips} setDailyTrips={setDailyTrips} />
          <Separator />
          <RecurringRoutes 
            recurringRoutes={recurringRoutes} 
            setRecurringRoutes={setRecurringRoutes}
            setDailyTrips={setDailyTrips}
          />
        </div>
      </main>
      <footer className="py-4 border-t">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
              <p>Journal de bord des distances</p>
          </div>
      </footer>
    </div>
  );
}
