import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards';

export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./employees-list.component').then(m => m.EmployeesListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./employee-form.component').then(m => m.EmployeeFormComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: ':id',
    loadComponent: () => import('./employee-detail.component').then(m => m.EmployeeDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./employee-form.component').then(m => m.EmployeeFormComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  }
];

