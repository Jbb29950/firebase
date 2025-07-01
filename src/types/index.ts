export interface DailyTrip {
  id: string;
  name: string;
  distance: number;
}

export interface RecurringRoute {
  id: string;
  name: string;
  waypoints: string[];
  distance?: number;
}
