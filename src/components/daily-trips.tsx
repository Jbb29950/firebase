"use client";

import { DailyTrip } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter as UiTableFooter,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';

interface DailyTripsProps {
  dailyTrips: DailyTrip[];
  setDailyTrips: React.Dispatch<React.SetStateAction<DailyTrip[]>>;
}

const tripSchema = z.object({
  name: z.string().min(1, { message: 'Trip name is required.' }),
  distance: z.coerce.number().min(0, { message: 'Distance must be a positive number.' }),
});

type TripFormValues = z.infer<typeof tripSchema>;

export function DailyTrips({ dailyTrips, setDailyTrips }: DailyTripsProps) {
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: '',
      distance: 0,
    },
  });

  const addTrip = (data: TripFormValues) => {
    const newTrip: DailyTrip = {
      id: crypto.randomUUID(),
      name: data.name,
      distance: data.distance,
    };
    setDailyTrips((prev) => [newTrip, ...prev]);
    form.reset();
  };

  const deleteTrip = (id: string) => {
    setDailyTrips((prev) => prev.filter((trip) => trip.id !== id));
  };

  const totalDistance = dailyTrips.reduce((acc, trip) => acc + trip.distance, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Trips</CardTitle>
        <CardDescription>Log your trips for today. Add a new trip or use one of your recurring routes below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(addTrip)} className="flex flex-col sm:flex-row items-end gap-4 p-4 border rounded-lg bg-muted/50">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-grow w-full sm:w-auto">
                  <FormLabel>Trip Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Home to Work" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="distance"
              render={({ field }) => (
                <FormItem className="w-full sm:w-auto">
                  <FormLabel>Distance (km)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g. 15.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Trip
            </Button>
          </form>
        </Form>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip Name</TableHead>
                <TableHead className="text-right w-[120px]">Distance</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyTrips.length > 0 ? (
                dailyTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.name}</TableCell>
                    <TableCell className="text-right">{trip.distance.toFixed(1)} km</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteTrip(trip.id)} aria-label="Delete trip">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                    No trips added for today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {dailyTrips.length > 0 && (
              <UiTableFooter>
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold text-lg text-primary">
                    {totalDistance.toFixed(1)} km
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </UiTableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
