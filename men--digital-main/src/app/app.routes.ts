import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/category-management.component').then(
            (m) => m.CategoryManagementComponent
          )
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-management.component').then(
            (m) => m.ProductManagementComponent
          )
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/user-management.component').then((m) => m.UserManagementComponent)
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./features/companies/company-management.component').then(
            (m) => m.CompanyManagementComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
