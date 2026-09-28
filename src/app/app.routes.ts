import { Routes } from '@angular/router';
import { RECORD_SLUG } from 'gn-library';
import { Landing } from './pages/landing/landing';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    component: Landing,
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search-results/search-results').then((m) => m.SearchResults),
  },
  {
    path: `${RECORD_SLUG}/:uuid`,
    loadComponent: () =>
      import('./pages/record-details/record-details').then((m) => m.RecordDetails),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
