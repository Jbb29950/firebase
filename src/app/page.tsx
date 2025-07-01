"use client";

import { useState } from 'react';
import { DailyTrip, RecurringRoute } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { AppHeader } from '@/components/header';
import { DailyTrips } from '@/components/daily-trips';
import { RecurringRoutes } from '@/components/recurring-routes';
import { Separator } from '@/components/ui/separator';

const initialRecurringRoutes: RecurringRoute[] = [
    {
        id: '1',
        name: 'Morning Commute',
        waypoints: ['123 Main St, Anytown, USA', '456 Oak Ave, Work City, USA'],
    },
    {
        id: '2',
        name: 'Evening Return',
        waypoints: ['456 Oak Ave, Work City, USA', '123 Main St, Anytown, USA'],
    },
    {
        id: '3',
        name: 'Weekend Errands',
        waypoints: ['Home', 'Grocery Store', 'Post Office', 'Hardware Store', 'Home'],
    }
];

export default function Home() {
  const [dailyTrips, setDailyTrips] = useState<DailyTrip[]>([]);
  const [recurringRoutes, setRecurringRoutes] = useLocalStorage<RecurringRoute[]>(
    'recurringRoutes',
    initialRecurringRoutes
  );

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
              <p>Distance Diary</p>
          </div>
      </footer>
    </div>
  );
}
