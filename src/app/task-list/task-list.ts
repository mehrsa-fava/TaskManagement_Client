import { Component, computed, signal, OnInit, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../services/task-service';
import { TaskUserService } from '../services/task-user-service';
import { SprintService } from '../services/sprint-service';
import { ProjectService } from '../services/project-service';
import { TagService } from '../services/tag-service';
import { ReportService } from '../services/report-service';
import type { Task, TaskStatus, TaskPriority } from '../model/task';
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '../model/task';
import type { BoardColumn } from '../model/board';
import { formatGregorianAsShamsi } from '../utils/jalali-date.util';
import { getAvatarColor, getInitial } from '../utils/avatar.util';
import { formatHours, parseHoursInput } from '../utils/hours.util';
import {
  BOARD_STATUS_ORDER,
  priorityColorClass,
  statusHeaderClass,
  statusLabel,
  tagColorClass,
} from '../utils/task-status.util';
import { TaskBoard } from '../task-board/task-board';
import { ProjectReports } from '../project-reports/project-reports';

export type TaskListFilter = 'all' | 'active' | 'completed';
export type WorkspaceView = 'list' | 'board' | 'reports';

const FILTER_TABS: { value: TaskListFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const VIEW_TABS: { value: WorkspaceView; label: string }[] = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
  { value: 'reports', label: 'Reports' },
];

export type EditingField =
  | 'title'
  | 'description'
  | 'status'
  | 'priority'
  | 'users'
  | 'timeEstimate'
  | 'timeTracked'
  | 'dueDate'
  | null;

@Component({
  selector: 'app-task-list',
  imports: [RouterLink, FormsModule, NgClass, TaskBoard, ProjectReports],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private readonly filterSignal = signal<TaskListFilter>('all');
  private readonly viewSignal = signal<WorkspaceView>('list');
  private readonly selectedTagIds = signal<number[]>([]);
  private readonly selectedUserIdsFilter = signal<string[]>([]);
  readonly selectedTaskIds = signal<Set<string>>(new Set());
  readonly boardColumns = signal<BoardColumn[]>([]);

  readonly projectId = signal<number | null>(null);
  /** 'backlog' = sprintId is null; number = specific sprint */
  readonly sprintFilter = signal<'backlog' | number>('backlog');

  constructor(
    protected taskService: TaskService,
    protected taskUserService: TaskUserService,
    protected sprintService: SprintService,
    protected projectService: ProjectService,
    protected tagService: TagService,
    protected reportService: ReportService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  readonly filterTabs = FILTER_TABS;
  readonly viewTabs = VIEW_TABS;
  readonly filter = this.filterSignal.asReadonly();
  readonly view = this.viewSignal.asReadonly();
  readonly filteredTasks = computed(() => {
    const tasks = this.taskService.tasks();
    const f = this.filterSignal();
    const sprintFilter = this.sprintFilter();
    const tagIds = this.selectedTagIds();
    const userIds = this.selectedUserIdsFilter();

    let scoped =
      sprintFilter === 'backlog'
        ? tasks.filter((t) => t.sprintId == null)
        : tasks.filter((t) => t.sprintId === sprintFilter);

    if (tagIds.length) {
      scoped = scoped.filter((t) => tagIds.every((id) => t.tags.some((tag) => tag.id === id)));
    }
    if (userIds.length) {
      scoped = scoped.filter((t) => userIds.every((id) => t.users.some((user) => user.id === id)));
    }
    if (f === 'active') return scoped.filter((t) => t.status !== 'Done');
    if (f === 'completed') return scoped.filter((t) => t.status === 'Done');
    return scoped;
  });

  readonly groupedTasks = computed(() => {
    const tasks = this.filteredTasks();
    return BOARD_STATUS_ORDER.map((status) => ({
      status,
      label: statusLabel(status),
      headerClass: statusHeaderClass(status),
      tasks: tasks.filter((task) => task.status === status),
    })).filter((group) => group.tasks.length > 0 || this.filterSignal() === 'all');
  });

  readonly viewTitle = computed(() => {
    const sprintFilter = this.sprintFilter();
    if (sprintFilter === 'backlog') return 'Backlogs';
    const pid = this.projectId();
    if (pid === null) return 'Sprint';
    const sprint = this.sprintService.sprintsForProject(pid).find((s) => s.id === sprintFilter);
    return sprint?.title ?? 'Sprint';
  });

  readonly projectTitle = computed(() => {
    const pid = this.projectId();
    if (pid === null) return '';
    return this.projectService.projects().find((p) => p.id === pid)?.title ?? '';
  });

  readonly activeSprint = computed(() => {
    const sprintFilter = this.sprintFilter();
    const pid = this.projectId();
    if (sprintFilter === 'backlog' || pid === null) return null;
    return this.sprintService.sprintsForProject(pid).find((s) => s.id === sprintFilter) ?? null;
  });

  readonly viewSubtitle = computed(() => {
    const sprint = this.activeSprint();
    if (!sprint) return 'Tasks not assigned to a sprint.';
    if (sprint.startDate && sprint.endDate) {
      return `${formatGregorianAsShamsi(sprint.startDate)} → ${formatGregorianAsShamsi(sprint.endDate)}`;
    }
    return 'Tasks in this sprint.';
  });

  readonly sprintGoal = computed(() => this.activeSprint()?.goal?.trim() ?? '');
  readonly projectTags = computed(() => {
    const pid = this.projectId();
    return pid == null ? [] : this.tagService.tagsForProject(pid);
  });
  readonly projectSprints = computed(() => {
    const pid = this.projectId();
    return pid == null ? [] : this.sprintService.sprintsForProject(pid);
  });
  readonly reportSprintId = computed(() => {
    const sprint = this.sprintFilter();
    return sprint === 'backlog' ? null : sprint;
  });

  ngOnInit(): void {
    this.projectService.loadProjects().subscribe();
    this.route.queryParamMap.subscribe((qm) => {
      const view = qm.get('view');
      if (view === 'board' || view === 'reports' || view === 'list') {
        this.viewSignal.set(view);
      }
    });
    this.route.paramMap.subscribe((pm) => {
      const rawProject = pm.get('projectId');
      const rawSprint = pm.get('sprintId');
      const projectId = rawProject ? parseInt(rawProject, 10) : NaN;

      if (!Number.isNaN(projectId)) {
        this.projectId.set(projectId);
        if (rawSprint) {
          const sprintId = parseInt(rawSprint, 10);
          this.sprintFilter.set(Number.isNaN(sprintId) ? 'backlog' : sprintId);
        } else {
          this.sprintFilter.set('backlog');
        }
        this.tagService.loadTags(projectId).subscribe();
        this.sprintService.loadSprints(projectId).subscribe();
        this.reloadWorkspace();
      } else {
        this.projectId.set(null);
      }
    });
    this.taskUserService.loadUsers().subscribe();
  }

  private reloadWorkspace(): void {
    const pid = this.projectId();
    if (pid === null) return;
    this.taskService
      .loadTasksByProjectId({
        projectId: pid,
        tagIds: this.selectedTagIds(),
        userIds: this.selectedUserIdsFilter(),
      })
      .subscribe(() => {
        if (this.viewSignal() === 'board') this.reloadBoard();
        if (this.viewSignal() === 'reports') this.reportService.loadProjectWorkload(pid).subscribe();
      });
  }

  private reloadBoard(): void {
    const pid = this.projectId();
    if (pid === null) return;
    this.taskService
      .loadBoard(pid, { tagIds: this.selectedTagIds(), userIds: this.selectedUserIdsFilter() })
      .subscribe((board) => {
        const sprintFilter = this.sprintFilter();
        const fromApi =
          sprintFilter === 'backlog'
            ? board.backlog
            : board.sprints.find((sprint) => sprint.id === sprintFilter)?.columns;
        const fallback = BOARD_STATUS_ORDER.map((status) => ({
          status,
          tasks: this.filteredTasks().filter((task) => task.status === status),
        }));
        this.boardColumns.set(fromApi?.length ? fromApi : fallback);
      });
  }

  private reloadTasksForProject(): void {
    this.reloadWorkspace();
  }

  addTaskQueryParams(): { projectId: number; sprintId?: number } | Record<string, never> {
    const pid = this.projectId();
    if (pid === null) return {};
    const sf = this.sprintFilter();
    if (sf === 'backlog') return { projectId: pid };
    return { projectId: pid, sprintId: sf };
  }

  setFilter(value: TaskListFilter | string): void {
    this.filterSignal.set(value as TaskListFilter);
  }

  setView(view: WorkspaceView): void {
    this.viewSignal.set(view);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge',
    });
    const pid = this.projectId();
    if (view === 'board') this.reloadBoard();
    if (view === 'reports' && pid != null) this.reportService.loadProjectWorkload(pid).subscribe();
  }

  toggleTagFilter(tagId: number): void {
    this.selectedTagIds.update((ids) =>
      ids.includes(tagId) ? ids.filter((id) => id !== tagId) : [...ids, tagId],
    );
    this.reloadWorkspace();
  }

  toggleUserFilter(userId: string): void {
    this.selectedUserIdsFilter.update((ids) =>
      ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId],
    );
    this.reloadWorkspace();
  }

  isTagFilterOn(tagId: number): boolean {
    return this.selectedTagIds().includes(tagId);
  }

  isUserFilterOn(userId: string): boolean {
    return this.selectedUserIdsFilter().includes(userId);
  }

  isCompleted(task: Task): boolean {
    return task.status === 'Done';
  }

  toggle(task: Task): void {
    this.taskService.toggleCompleted(task.id).subscribe();
  }

  delete(task: Task): void {
    this.taskService.deleteTask(task.id).subscribe();
  }

  clearCompleted(): void {
    this.taskService.clearCompleted().subscribe(() => this.reloadTasksForProject());
  }

  openTask(task: Task): void {
    this.router.navigate(['/task/form', task.id]);
  }

  onBoardStatusChange(event: { taskId: string; status: TaskStatus }): void {
    this.taskService.setStatus(event.taskId, event.status).subscribe((ok) => {
      if (ok) this.reloadBoard();
    });
  }

  onBoardAddTask(event: { title: string; status: TaskStatus }): void {
    const pid = this.projectId();
    if (pid == null) return;
    const sprintFilter = this.sprintFilter();
    const sprintId = sprintFilter === 'backlog' ? null : sprintFilter;
    this.taskService
      .addTask({ title: event.title, status: event.status, projectId: pid, sprintId })
      .subscribe(() => this.reloadWorkspace());
  }

  toggleSelected(taskId: string): void {
    this.selectedTaskIds.update((set) => {
      const next = new Set(set);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  isSelected(taskId: string): boolean {
    return this.selectedTaskIds().has(taskId);
  }

  bulkChangeStatus(status: TaskStatus | ''): void {
    const pid = this.projectId();
    const ids = [...this.selectedTaskIds()];
    if (!status || pid == null || ids.length === 0) return;
    this.taskService.changeTasksStatus(pid, ids, status).subscribe((ok) => {
      if (!ok) return;
      this.selectedTaskIds.set(new Set());
      this.reloadWorkspace();
    });
  }

  // ─── Inline Editing State ───

  readonly editingTaskId = signal<string | null>(null);
  readonly editingField = signal<EditingField>(null);
  readonly editValue = signal<string>('');
  readonly selectedUserIds = signal<Set<string>>(new Set());

  readonly statusOptions = TASK_STATUS_OPTIONS;
  readonly priorityOptions = TASK_PRIORITY_OPTIONS;
  readonly statusLabel = statusLabel;
  readonly statusHeaderClass = statusHeaderClass;
  readonly tagColorClass = tagColorClass;
  readonly formatHours = formatHours;
  readonly formatDue = formatGregorianAsShamsi;

  isEditing(taskId: string, field: NonNullable<EditingField>): boolean {
    return this.editingTaskId() === taskId && this.editingField() === field;
  }

  startEdit(task: Task, field: NonNullable<EditingField>): void {
    this.editingTaskId.set(task.id);
    this.editingField.set(field);

    if (field === 'title') {
      this.editValue.set(task.title);
    } else if (field === 'description') {
      this.editValue.set(task.description ?? '');
    } else if (field === 'status') {
      this.editValue.set(task.status);
    } else if (field === 'priority') {
      this.editValue.set(task.priority);
    } else if (field === 'timeEstimate') {
      this.editValue.set(task.timeEstimate != null ? String(task.timeEstimate) : '');
    } else if (field === 'timeTracked') {
      this.editValue.set('');
    } else if (field === 'dueDate') {
      this.editValue.set(task.dueDate ?? '');
    }
  }

  cancelEdit(): void {
    this.editingTaskId.set(null);
    this.editingField.set(null);
    this.editValue.set('');
    this.selectedUserIds.set(new Set());
  }

  saveEdit(taskId: string): void {
    const field = this.editingField();
    if (!field) return;

    const value = this.editValue().trim();

    if (field === 'title') {
      if (!value) {
        this.cancelEdit();
        return;
      }
      this.taskService.updateTask(taskId, { title: value }).subscribe(() => this.cancelEdit());
    } else if (field === 'description') {
      this.taskService
        .updateTask(taskId, { description: value })
        .subscribe(() => this.cancelEdit());
    } else if (field === 'status') {
      this.taskService.setStatus(taskId, value as TaskStatus).subscribe(() => this.cancelEdit());
    } else if (field === 'priority') {
      this.taskService
        .updateTask(taskId, { priority: value as TaskPriority })
        .subscribe(() => this.cancelEdit());
    } else if (field === 'timeEstimate') {
      const hours = parseHoursInput(value);
      this.taskService
        .updateTask(taskId, { timeEstimate: hours })
        .subscribe(() => this.cancelEdit());
    } else if (field === 'timeTracked') {
      const hours = parseHoursInput(value);
      if (hours == null) {
        this.cancelEdit();
        return;
      }
      const current = this.taskService.getTask(taskId)?.timeTracked ?? 0;
      this.taskService
        .updateTask(taskId, { timeTracked: current + hours })
        .subscribe(() => this.cancelEdit());
    } else if (field === 'dueDate') {
      this.taskService
        .updateTask(taskId, { dueDate: value || null })
        .subscribe(() => this.cancelEdit());
    }
  }

  onKeydown(event: KeyboardEvent, taskId: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveEdit(taskId);
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  startUsersEdit(task: Task): void {
    this.editingTaskId.set(task.id);
    this.editingField.set('users');
    this.selectedUserIds.set(new Set((task.users ?? []).map((u) => u.id)));
  }

  toggleUserInEdit(userId: string): void {
    this.selectedUserIds.update((current) => {
      const next = new Set(current);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  isUserSelectedInEdit(userId: string): boolean {
    return this.selectedUserIds().has(userId);
  }

  saveUsersEdit(taskId: string): void {
    const task = this.taskService.getTask(taskId);
    if (!task) {
      this.cancelEdit();
      return;
    }

    const nextUserIds = Array.from(this.selectedUserIds());
    const currentUserIds = (task.users ?? []).map((u) => u.id);
    const hasChanges =
      nextUserIds.length !== currentUserIds.length ||
      nextUserIds.some((id) => !currentUserIds.includes(id));

    if (!hasChanges) {
      this.cancelEdit();
      return;
    }

    this.taskService.updateTask(taskId, { userIds: nextUserIds }).subscribe(() => {
      this.cancelEdit();
      this.reloadTasksForProject();
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.editingField() !== 'users') return;

    const target = event.target as HTMLElement | null;
    if (target?.closest('.users-edit-container')) return;

    const taskId = this.editingTaskId();
    if (!taskId) {
      this.cancelEdit();
      return;
    }

    this.saveUsersEdit(taskId);
  }

  selectStatus(taskId: string, status: TaskStatus): void {
    this.editValue.set(status);
    this.saveEdit(taskId);
  }

  selectPriority(taskId: string, priority: TaskPriority): void {
    this.editValue.set(priority);
    this.saveEdit(taskId);
  }

  statusBgClass(status: TaskStatus): string {
    return statusHeaderClass(status);
  }

  statusTextClass(_status: TaskStatus): string {
    return '';
  }

  priorityColorClass = priorityColorClass;
  getInitial = getInitial;
  getAvatarColor = getAvatarColor;
}
