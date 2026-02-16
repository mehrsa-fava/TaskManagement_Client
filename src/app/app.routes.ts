import { Routes } from '@angular/router';
import { TaskList } from './task-list/task-list';
import { Login } from './login/login';
import { Register } from './register/register';
import { TaskForm } from './task-form/task-form';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'task/list', pathMatch: 'full' },
  {
    path: 'task/list',
    component: TaskList,
    canActivate: [authGuard],
  },
  {
    path: 'task/form',
    component: TaskForm,
    canActivate: [authGuard],
  },
  {
    path: 'task/form/:id',
    component: TaskForm,
    canActivate: [authGuard],
  },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
];
