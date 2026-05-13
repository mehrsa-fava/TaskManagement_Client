import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../services/project-service';
import { ProfileMenu } from '../profile-menu/profile-menu';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, ProfileMenu],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList implements OnInit {
  readonly searchTerm = signal('');

  constructor(protected readonly projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.loadProjects().subscribe();
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
