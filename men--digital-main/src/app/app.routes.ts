import { Routes } from '@angular/router';

import { CategoriesComponent } from './features/categories/categories.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'categorias' },
  { path: 'categorias', component: CategoriesComponent },
  { path: '**', redirectTo: 'categorias' },
];
