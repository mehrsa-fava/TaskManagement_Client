import { Routes } from '@angular/router';
import { TaskList } from './task-list/task-list';
import { Login } from './login/login';
import { Register } from './register/register';
import { TaskForm } from './task-form/task-form';
import { ProjectList } from './project-list/project-list';
import { ProjectForm } from './project-form/project-form';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'project/list', pathMatch: 'full' },
  {
    path: 'project/list',
    component: ProjectList,
    canActivate: [authGuard],
  },
  {
    path: 'project/form',
    component: ProjectForm,
    canActivate: [authGuard],
  },
  {
    path: 'project/form/:id',
    component: ProjectForm,
    canActivate: [authGuard],
  },
  { path: 'task/list', redirectTo: 'project/list', pathMatch: 'full' },
  {
    path: 'task/list/:projectId',
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
