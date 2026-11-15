import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { ProjectService } from '../services/project-service';

/** Blocks employees from creating or editing projects and sprints, directing them to tasks. */
export const workspaceWriteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const projectService = inject(ProjectService);

  if (auth.canManageWorkspace()) {
    return true;
  }

  const existing = projectService.projects();
  if (existing.length > 0) {
    router.navigate(['/project', existing[0].id, 'backlog']);
  } else {
    router.navigate(['/project/list']);
  }
  return false;
};
