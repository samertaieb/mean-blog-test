import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const appRoutes: Routes = [
  { path: '', loadComponent: () =>
      import('./features/articles/list/articles-list.component').then(m => m.ArticlesListComponent)
  },

  { path: 'articles/new',
    canActivate: [authGuard, roleGuard(['writer','editor','admin'])],
    loadComponent: () =>
      import('./features/articles/edit/article-edit.component').then(m => m.ArticleEditComponent)
  },

  { path: 'articles/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/articles/edit/article-edit.component').then(m => m.ArticleEditComponent)
  },

  { path: 'articles/:id',
    loadComponent: () =>
      import('./features/articles/detail/article-detail.component').then(m => m.ArticleDetailComponent)
  },

  { path: 'admin/users',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/users/users.component').then(m => m.UsersComponent)
  },

  { path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent)
  },

  { path: '**', redirectTo: '' }
];
