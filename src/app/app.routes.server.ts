import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'task/list/:projectId', renderMode: RenderMode.Server },
  { path: 'task/form/:id', renderMode: RenderMode.Server },
  { path: 'project/form/:id', renderMode: RenderMode.Server },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
