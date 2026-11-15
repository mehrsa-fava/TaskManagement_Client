import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { ProjectService } from '../services/project-service';

@Component({
  selector: 'app-workspace-home',
  standalone: true,
  template: `
    <div class="workspace-home">
      @if (isEmployee()) {
        <h1>Tasks</h1>
        <p>No projects or tasks available yet. When a project is assigned to you, your tasks will appear here.</p>
      } @else {
        <h1>Welcome</h1>
        <p>Select <strong>Backlogs</strong> or a <strong>Sprint</strong> from the sidebar to view tasks.</p>
      }
    </div>
  `,
  styles: `
    .workspace-home {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100%;
      padding: 2rem;
      text-align: center;
      color: #475569;
    }
    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }
    p {
      margin: 0;
      max-width: 24rem;
      line-height: 1.5;
    }
  `,
})
export class WorkspaceHome implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);

  readonly isEmployee = this.authService.isEmployee;

  ngOnInit(): void {
    if (this.authService.isEmployee()) {
      const existing = this.projectService.projects();
      if (existing.length > 0) {
        this.router.navigate(['/project', existing[0].id, 'backlog']);
        return;
      }
      this.projectService.loadProjects().subscribe((projects) => {
        if (projects.length > 0) {
          this.router.navigate(['/project', projects[0].id, 'backlog']);
        }
      });
    }
  }
}
