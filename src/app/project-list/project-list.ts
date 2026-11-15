import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../services/project-service';
import { AuthService } from '../services/auth-service';
import { ProfileMenu } from '../profile-menu/profile-menu';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, ProfileMenu],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList implements OnInit {
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly projectService = inject(ProjectService);

  readonly canManageWorkspace = this.authService.canManageWorkspace;
  readonly searchTerm = signal('');

  ngOnInit(): void {
    if (this.authService.isEmployee()) {
      const existing = this.projectService.projects();
      if (existing.length > 0) {
        this.router.navigate(['/project', existing[0].id, 'backlog']);
        return;
      }
    }
    this.projectService.loadProjects().subscribe((projects) => {
      if (this.authService.isEmployee() && projects.length > 0) {
        this.router.navigate(['/project', projects[0].id, 'backlog']);
      }
    });
  }

  filteredProjects = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.projectService.projects();
    if (!term) return list;
    return list.filter((p) => p.title.toLowerCase().includes(term));
  });

  deleteProject(id: number, title: string): void {
    if (!confirm(`Delete project "${title}"? Tasks for this project are not removed by this action.`)) return;
    this.projectService.deleteProject(id).subscribe();
  }

  memberLabel(project: { userIds: string[] }): string {
    const n = project.userIds?.length ?? 0;
    return `${n} member${n === 1 ? '' : 's'}`;
  }
}
