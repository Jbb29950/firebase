"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RecurringRoute, DailyTrip } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';

const routeSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'itinéraire est requis.'),
  waypoints: z.array(z.string().min(1, 'Le point de cheminement ne peut pas être vide.')).min(2, 'Au moins deux points de cheminement sont requis.'),
});

type RouteFormValues = z.infer<typeof routeSchema>;

interface RecurringRouteFormProps {
  onSave: (route: RecurringRoute) => void;
  onClose: () => void;
  existingRoute?: RecurringRoute;
}

export function RecurringRouteForm({ onSave, onClose, existingRoute }: RecurringRouteFormProps) {
  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: existingRoute?.name || '',
      waypoints: existingRoute?.waypoints || ['', ''],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'waypoints',
  });

  const onSubmit = (data: RouteFormValues) => {
    const route: RecurringRoute = {
      id: existingRoute?.id || crypto.randomUUID(),
      ...data,
    };
    onSave(route);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l'itinéraire</FormLabel>
              <FormControl>
                <Input placeholder="ex: Trajet quotidien" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Points de cheminement</FormLabel>
          <FormDescription className="text-xs mb-2">Saisissez les adresses ou les lieux de cet itinéraire.</FormDescription>
          <div className="space-y-2 mt-2">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`waypoints.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder={`Point de cheminement ${index + 1}`} {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 2}
                        aria-label="Supprimer le point de cheminement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append('')}
            className="mt-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un point de cheminement
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit">Enregistrer l'itinéraire</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

const addTripSchema = z.object({
    distance: z.coerce.number().positive("La distance doit être un nombre positif.")
})
type AddTripValues = z.infer<typeof addTripSchema>

interface AddTripFromRouteDialogProps {
    route: RecurringRoute,
    setDailyTrips: React.Dispatch<React.SetStateAction<DailyTrip[]>>
}
export function AddTripFromRouteDialog({ route, setDailyTrips }: AddTripFromRouteDialogProps) {
    const [open, setOpen] = useState(false);
    const form = useForm<AddTripValues>({
        resolver: zodResolver(addTripSchema),
        defaultValues: { distance: 0 }
    })

    const onSubmit = (data: AddTripValues) => {
        const newTrip: DailyTrip = {
            id: crypto.randomUUID(),
            name: route.name,
            distance: data.distance
        }
        setDailyTrips(prev => [newTrip, ...prev]);
        setOpen(false);
        form.reset();
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Utiliser l'itinéraire</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajouter un trajet depuis '{route.name}'</DialogTitle>
                    <DialogDescription>
                        Saisissez la distance pour le trajet d'aujourd'hui en utilisant cet itinéraire.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="distance"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Distance (km)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.1" placeholder="e.g. 25.4" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">Annuler</Button>
                            </DialogClose>
                            <Button type="submit">Ajouter aux trajets d'aujourd'hui</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
