"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RecurringRoute } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { calculateTotalDistanceForRoute } from '@/lib/route-utils';

const routeSchema = z.object({
  name: z.string().min(1, "Le nom de l'itinéraire est requis."),
  waypoints: z.array(z.string()).min(2, 'Au moins deux points de cheminement sont requis.'),
});

type RouteFormValues = z.infer<typeof routeSchema>;

interface RecurringRouteFormProps {
  onSave: (route: RecurringRoute) => void;
  onClose: () => void;
  existingRoute?: RecurringRoute;
}

export function RecurringRouteForm({ onSave, onClose, existingRoute }: RecurringRouteFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: existingRoute?.name || '',
      waypoints: existingRoute?.waypoints?.length ? existingRoute.waypoints : ['', ''],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'waypoints',
  });

  const onSubmit = async (data: RouteFormValues) => {
    setIsSaving(true);
    try {
      const validWaypoints = data.waypoints.filter(wp => wp.trim() !== '');
      if (validWaypoints.length < 2) {
          toast({
              variant: 'destructive',
              title: 'Points de cheminement invalides',
              description: 'Veuillez fournir au moins deux points de cheminement valides.',
          });
          setIsSaving(false);
          return;
      }

      const totalDistance = await calculateTotalDistanceForRoute(validWaypoints);
      
      const route: RecurringRoute = {
        id: existingRoute?.id || crypto.randomUUID(),
        name: data.name,
        waypoints: validWaypoints,
        distance: totalDistance,
      };
      onSave(route);
    } catch (error) {
      console.error("Échec du calcul de la distance de l'itinéraire", error);
      toast({
        variant: 'destructive',
        title: 'Erreur de calcul',
        description: "Impossible de calculer la distance de l'itinéraire. Veuillez vérifier les adresses et réessayer.",
      });
    } finally {
      setIsSaving(false);
    }
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
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Calcul...' : "Enregistrer l'itinéraire"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
