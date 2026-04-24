import { Routes } from '@angular/router';

export const LEAVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./leave-list.component').then(m => m.LeaveListComponent)
  }
];
