"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RecurringRoute } from '@/types';
import { optimizeRecurringRoutes, OptimizeRecurringRoutesOutput } from '@/ai/flows/optimize-recurring-routes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from './ui/separator';

interface RouteOptimizerProps {
  recurringRoutes: RecurringRoute[];
}

const optimizerSchema = z.object({
  optimizationCriteria: z.string().min(10, "Veuillez fournir des critères d'optimisation (au moins 10 caractères)."),
});

type OptimizerFormValues = z.infer<typeof optimizerSchema>;

export function RouteOptimizer({ recurringRoutes }: RouteOptimizerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [optimizations, setOptimizations] = useState<OptimizeRecurringRoutesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OptimizerFormValues>({
    resolver: zodResolver(optimizerSchema),
    defaultValues: { optimizationCriteria: 'Minimiser le temps de trajet et trouver la distance la plus courte.' }
  });

  const handleSubmit = async (data: OptimizerFormValues) => {
    setIsLoading(true);
    setError(null);
    setOptimizations(null);
    try {
      const result = await optimizeRecurringRoutes({
        recurringRoutes: recurringRoutes,
        optimizationCriteria: data.optimizationCriteria,
      });
      setOptimizations(result);
    } catch (e) {
      setError("Une erreur est survenue lors de l'optimisation des itinéraires. Veuillez réessayer.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Optimiseur d'itinéraire IA</DialogTitle>
        <DialogDescription>
          Obtenez des suggestions basées sur l'IA pour rendre vos itinéraires récurrents plus efficaces.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 py-4">
        <div className="flex flex-col">
          <h3 className="font-semibold mb-2">Vos itinéraires et critères</h3>
          <Card className="mb-4">
            <CardContent className="p-4">
              <ScrollArea className="h-32">
                <ul className="space-y-2">
                  {recurringRoutes.map(route => (
                    <li key={route.id} className="text-sm">
                      <strong className="font-medium text-primary">{route.name}:</strong> {route.waypoints.join(' → ')}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="optimizationCriteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Critères d'optimisation</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ex: Minimiser le temps de trajet, éviter les péages..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Suggérer des optimisations
              </Button>
            </form>
          </Form>
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold mb-2">Suggestions de l'IA</h3>
            <div className="border rounded-lg h-full min-h-[21rem] flex flex-col">
              {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              )}
              {error && <div className="p-4"><Alert variant="destructive"><AlertTitle>Erreur</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>}
              {optimizations && (
                <ScrollArea className="flex-grow">
                  <div className="p-4 space-y-4">
                    {optimizations.optimizedRoutes.map((opt, index) => (
                      <Card key={index} className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-base">{opt.routeName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div>
                            <h4 className="font-medium text-muted-foreground">Itinéraire original :</h4>
                            <p>{opt.originalRoute.join(' → ')}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-primary">Itinéraire optimisé :</h4>
                            <p className="font-semibold">{opt.optimizedWaypoints.join(' → ')}</p>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-medium text-muted-foreground">Résumé :</h4>
                            <p>{opt.optimizationSummary}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {!isLoading && !error && !optimizations && (
                <div className="flex items-center justify-center h-full bg-muted/30 rounded-b-lg">
                    <p className="text-muted-foreground text-center p-4">Les suggestions de l'IA apparaîtront ici.</p>
                </div>
              )}
            </div>
        </div>
      </div>
    </DialogContent>
  );
}
