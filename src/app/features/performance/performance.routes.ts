import { Routes } from '@angular/router';

export const PERFORMANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./performance-list.component').then(m => m.PerformanceListComponent)
  }
];
