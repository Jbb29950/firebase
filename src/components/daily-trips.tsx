"use client";

import { useState } from 'react';
import { DailyTrip } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { calculateDistance } from '@/ai/flows/calculate-distance-flow';
import { useToast } from '@/hooks/use-toast';

interface DailyTripsProps {
  dailyTrips: DailyTrip[];
  setDailyTrips: React.Dispatch<React.SetStateAction<DailyTrip[]>>;
}

const tripSchema = z.object({
  startAddress: z.string().min(3, { message: "L'adresse de départ est requise (3 caractères min)." }),
  endAddress: z.string().min(3, { message: "L'adresse d'arrivée est requise (3 caractères min)." }),
});

type TripFormValues = z.infer<typeof tripSchema>;

export function DailyTrips({ dailyTrips, setDailyTrips }: DailyTripsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      startAddress: '',
      endAddress: '',
    },
  });

  const onSubmit = async (data: TripFormValues) => {
    setIsLoading(true);
    try {
      const result = await calculateDistance({
        startAddress: data.startAddress,
        endAddress: data.endAddress,
      });

      const newTrip: DailyTrip = {
        id: crypto.randomUUID(),
        name: `${data.startAddress} → ${data.endAddress}`,
        distance: result.distance,
      };
      setDailyTrips((prev) => [newTrip, ...prev]);
      form.reset();
    } catch (error) {
      console.error("Échec du calcul de la distance", error);
      toast({
        variant: 'destructive',
        title: 'Erreur de calcul',
        description: "Impossible de calculer la distance. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTrip = (id: string) => {
    setDailyTrips((prev) => prev.filter((trip) => trip.id !== id));
  };

  const totalDistance = dailyTrips.reduce((acc, trip) => acc + trip.distance, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trajets d'aujourd'hui</CardTitle>
        <CardDescription>Enregistrez vos trajets d'aujourd'hui. Saisissez un départ et une arrivée pour calculer la distance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-end gap-4 p-4 border rounded-lg bg-muted/50">
            <FormField
              control={form.control}
              name="startAddress"
              render={({ field }) => (
                <FormItem className="flex-grow w-full sm:w-auto">
                  <FormLabel>Adresse de départ</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: 123 Rue Principale, Anytown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endAddress"
              render={({ field }) => (
                <FormItem className="flex-grow w-full sm:w-auto">
                  <FormLabel>Adresse d'arrivée</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: 456 Avenue du Chêne, Work City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Calcul...' : 'Ajouter un trajet'}
            </Button>
          </form>
        </Form>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du trajet</TableHead>
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
                      <Button variant="ghost" size="icon" onClick={() => deleteTrip(trip.id)} aria-label="Supprimer le trajet">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                    Aucun trajet ajouté pour aujourd'hui.
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
