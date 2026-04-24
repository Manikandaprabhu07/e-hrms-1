import { Routes } from '@angular/router';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./events-calendar.component').then(m => m.EventsCalendarComponent)
  }
];
