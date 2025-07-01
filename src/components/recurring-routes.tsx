"use client";

import { useState } from 'react';
import { RecurringRoute, DailyTrip } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, MapPin, Sparkles, Route, Loader2 } from 'lucide-react';
import { RecurringRouteForm } from './recurring-route-modals';
import { RouteOptimizer } from './route-optimizer';
import { useToast } from '@/hooks/use-toast';

interface RecurringRoutesProps {
  recurringRoutes: RecurringRoute[];
  setRecurringRoutes: (routes: RecurringRoute[] | ((prev: RecurringRoute[]) => RecurringRoute[])) => void;
  setDailyTrips: React.Dispatch<React.SetStateAction<DailyTrip[]>>;
}

export function RecurringRoutes({
  recurringRoutes,
  setRecurringRoutes,
  setDailyTrips,
}: RecurringRoutesProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RecurringRoute | undefined>(undefined);
  const { toast } = useToast();

  const handleSaveRoute = (route: RecurringRoute) => {
    if (editingRoute) {
      setRecurringRoutes((prev) => prev.map((r) => (r.id === route.id ? route : r)));
    } else {
      setRecurringRoutes((prev) => [...prev, route]);
    }
    setIsFormOpen(false);
    setEditingRoute(undefined);
  };

  const openEditForm = (route: RecurringRoute) => {
    setEditingRoute(route);
    setIsFormOpen(true);
  };
  
  const openNewForm = () => {
    setEditingRoute(undefined);
    setIsFormOpen(true);
  }

  const deleteRoute = (id: string) => {
    setRecurringRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUseRoute = (route: RecurringRoute) => {
    if (typeof route.distance !== 'number') {
      toast({
        title: 'Distance non disponible',
        description: 'La distance pour cet itinéraire est encore en cours de calcul.',
        variant: 'default',
      });
      return;
    }
    const newTrip: DailyTrip = {
      id: crypto.randomUUID(),
      name: route.name,
      distance: route.distance,
    };
    setDailyTrips(prev => [newTrip, ...prev]);
    toast({
        title: 'Trajet ajouté',
        description: `"${route.name}" a été ajouté à vos trajets d'aujourd'hui.`,
    })
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>Itinéraires récurrents</CardTitle>
                <CardDescription>Gérez vos itinéraires enregistrés pour une saisie rapide.</CardDescription>
            </div>
            <div className="flex gap-2">
                 <Button onClick={openNewForm}>
                    <Plus className="mr-2 h-4 w-4" /> Nouvel itinéraire
                 </Button>
                <Button variant="outline" onClick={() => setIsOptimizerOpen(true)} disabled={recurringRoutes.length === 0}>
                    <Sparkles className="mr-2 h-4 w-4 text-accent" /> Optimiser les itinéraires
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {recurringRoutes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recurringRoutes.map((route) => (
              <Card key={route.id} className="flex flex-col hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Route className="h-5 w-5 text-primary" />
                    {route.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 pt-1">
                    {typeof route.distance === 'number' ? (
                        <>{route.distance.toFixed(1)} km</>
                    ) : (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Calcul de la distance...</span>
                        </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {route.waypoints.map((waypoint, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="break-all">{waypoint}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 bg-muted/50 p-3 rounded-b-lg">
                  <Button 
                    onClick={() => handleUseRoute(route)} 
                    className="bg-accent text-accent-foreground hover:bg-accent/90" 
                    disabled={typeof route.distance !== 'number'}
                  >
                    Utiliser l'itinéraire
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditForm(route)} aria-label="Modifier l'itinéraire">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteRoute(route.id)} aria-label="Supprimer l'itinéraire">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Aucun itinéraire récurrent enregistré pour le moment.</p>
            <Button variant="link" onClick={openNewForm}>Créez votre premier itinéraire récurrent</Button>
          </div>
        )}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoute ? "Modifier l'itinéraire récurrent" : "Ajouter un nouvel itinéraire récurrent"}</DialogTitle>
          </DialogHeader>
          <RecurringRouteForm
            onSave={handleSaveRoute}
            onClose={() => setIsFormOpen(false)}
            existingRoute={editingRoute}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isOptimizerOpen} onOpenChange={setIsOptimizerOpen}>
        <RouteOptimizer recurringRoutes={recurringRoutes} />
      </Dialog>
    </Card>
  );
}
