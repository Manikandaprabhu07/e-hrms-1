import { Routes } from '@angular/router';

export const ACTIVITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./recent-activity.component').then(m => m.RecentActivityComponent)
  }
];
