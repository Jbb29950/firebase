import { Route } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-6 mb-4 border-b">
      <div className="container mx-auto flex items-center gap-3">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
          <Route className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Distance Diary
        </h1>
      </div>
    </header>
  );
}
