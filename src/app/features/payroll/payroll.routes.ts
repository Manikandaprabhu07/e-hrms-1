import { Routes } from '@angular/router';

export const PAYROLL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./payroll-list.component').then(m => m.PayrollListComponent)
  }
];
