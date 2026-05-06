import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: '',
    renderMode: RenderMode.Client
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client
  },
  {
    path: 'employees',
    renderMode: RenderMode.Client
  },
  {
    path: 'employees/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'employees/:id/edit',
    renderMode: RenderMode.Client
  },
  {
    path: 'payroll',
    renderMode: RenderMode.Client
  },
  {
    path: 'attendance',
    renderMode: RenderMode.Client
  },
  {
    path: 'leave',
    renderMode: RenderMode.Client
  },
  {
    path: 'performance',
    renderMode: RenderMode.Client
  },
  {
    path: 'training',
    renderMode: RenderMode.Client
  },
  {
    path: 'feedback',
    renderMode: RenderMode.Client
  },
  {
    path: 'activity',
    renderMode: RenderMode.Client
  },
  {
    path: 'events',
    renderMode: RenderMode.Client
  },
  {
    path: 'account-settings',
    renderMode: RenderMode.Client
  },
  {
    path: 'access-denied',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
