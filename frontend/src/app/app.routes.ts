import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'visa-bulletin',
    loadComponent: () =>
      import('./features/visa-bulletin/visa-bulletin.component').then(m => m.VisaBulletinComponent)
  },
  {
    path: 'perm-timeline',
    loadComponent: () =>
      import('./features/perm-timeline/perm-timeline.component').then(m => m.PermTimelineComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
