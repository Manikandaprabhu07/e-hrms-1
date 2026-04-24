import { Routes } from '@angular/router';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./attendance-list.component').then(m => m.AttendanceListComponent)
  }
];
