import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { TaskService } from '../services/task-service';
import { TaskUserService } from '../services/task-user-service';
import { ProjectService } from '../services/project-service';
import { TagService } from '../services/tag-service';
import { CommonModule } from '@angular/common';
import { PersianDateInputComponent } from '../persian-date-input/persian-date-input';
import {
  type Task,
  type TaskStatus,
  type TaskPriority,
  type TaskType,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_TYPE_OPTIONS,
} from '../model/task';
import type { TagColor } from '../model/tag';
import { TAG_COLOR_OPTIONS } from '../model/tag';
import { getAvatarColor, getInitial } from '../utils/avatar.util';
import { parseRelatedTaskIds, serializeRelatedTaskIds } from '../utils/related-tasks.util';
import { formatActivityTime, parseActivityLines } from '../utils/activity-log.util';
import { formatHours } from '../utils/hours.util';
import { statusDotClass, statusLabel, tagColorClass } from '../utils/task-status.util';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NgClass,
    PersianDateInputComponent,
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm implements OnInit {
  taskForm!: FormGroup;

  error = '';
  submitting = false;
  searchTerm = signal('');
  relatedQuery = signal('');
  tagDraft = '';
  tagColor: TagColor = 'Pink';
  commentDraft = '';
  addTimeDraft = '';
  showRelated = false;

  readonly isEditMode = signal(false);
  private taskId: string | null = null;
  private sprintId: number | null = null;
  readonly currentTask = signal<Task | null>(null);

  readonly statusOptions = TASK_STATUS_OPTIONS;
  readonly priorityOptions = TASK_PRIORITY_OPTIONS;
  readonly typeOptions = TASK_TYPE_OPTIONS;
  readonly tagColorOptions = TAG_COLOR_OPTIONS;
  readonly statusLabel = statusLabel;
  readonly statusDotClass = statusDotClass;
  readonly tagColorClass = tagColorClass;
  readonly formatHours = formatHours;
  readonly formatActivityTime = formatActivityTime;

  private readonly taskUserService = inject(TaskUserService);
  readonly users = this.taskUserService.users;
  readonly usersLoading = this.taskUserService.loading;
  readonly usersError = this.taskUserService.error;
  readonly selectedUserIds = signal<Set<string>>(new Set());
  readonly selectedTagIds = signal<number[]>([]);
  readonly relatedIds = signal<string[]>([]);

  constructor(
    private taskService: TaskService,
    readonly projectService: ProjectService,
    readonly tagService: TagService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.taskUserService.loadUsers().subscribe();
    this.projectService.loadProjects().subscribe();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskForm.get('projectId')?.disable({ emitEvent: false });
      this.loadTask(id);
    } else {
      const qp = this.route.snapshot.queryParamMap.get('projectId');
      const n = qp ? parseInt(qp, 10) : NaN;
      if (!Number.isNaN(n)) {
        this.taskForm.patchValue({ projectId: n });
        this.tagService.loadTags(n).subscribe();
      }
      this.sprintId = this.parseSprintIdFromQuery(this.route.snapshot.queryParamMap.get('sprintId'));
    }
  }

  private parseSprintIdFromQuery(raw: string | null): number | null {
    if (raw === null || raw === '' || raw === 'null') return null;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  }

  toggleUser(userId: string): void {
    this.selectedUserIds.update((set) => {
      const next = new Set(set);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUserIds().has(userId);
  }

  private initForm(): void {
    this.taskForm = new FormGroup({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl('', { nonNullable: true }),
      priority: new FormControl<TaskPriority>('Medium', { nonNullable: true }),
      status: new FormControl<TaskStatus>('Open', { nonNullable: true }),
      taskType: new FormControl<TaskType>('Task', { nonNullable: true }),
      projectId: new FormControl<number | null>(null, Validators.required),
      dueDate: new FormControl('', { nonNullable: true }),
      timeEstimate: new FormControl<number | null>(null),
      sprintPoints: new FormControl<number | null>(null),
    });
  }

  private loadTask(id: string): void {
    const localTask = this.taskService.getTask(id);
    if (localTask) {
      this.applyTask(localTask, id);
      this.taskService.getTaskById(id).subscribe((task) => {
        if (task) this.applyTask(task, id);
      });
    } else {
      this.taskService.getTaskById(id).subscribe((task) => {
        if (task) this.applyTask(task, id);
      });
    }
  }

  private applyTask(task: Task, id: string): void {
    this.taskId = id;
    this.isEditMode.set(true);
    this.sprintId = task.sprintId ?? null;
    this.currentTask.set(task);
    if (task.projectId) this.tagService.loadTags(task.projectId).subscribe();
    if (task.projectId) this.taskService.loadProjectTasksCache(task.projectId).subscribe();

    this.taskForm.patchValue({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      status: task.status,
      taskType: task.taskType ?? 'Task',
      projectId: task.projectId ?? null,
      dueDate: task.dueDate ?? '',
      timeEstimate: task.timeEstimate ?? null,
      sprintPoints: task.sprintPoints ?? null,
    });
    this.taskForm.get('projectId')?.disable({ emitEvent: false });
    this.selectedUserIds.set(new Set(task.users?.map((u) => u.id).filter((uid) => uid?.trim()) ?? []));
    this.selectedTagIds.set(task.tags.map((tag) => tag.id));
    this.relatedIds.set(parseRelatedTaskIds(task.relatedTasks).filter((relatedId) => relatedId !== id));
  }

  readonly activityLines = computed(() => parseActivityLines(this.currentTask()?.activity));
  readonly projectTags = computed(() => {
    const id = Number(this.taskForm?.getRawValue()?.projectId);
    return Number.isNaN(id) ? [] : this.tagService.tagsForProject(id);
  });
  readonly relatedTasks = computed(() => {
    const ids = this.relatedIds();
    const projectId = Number(this.taskForm?.getRawValue()?.projectId);
    const pool = Number.isNaN(projectId)
      ? this.taskService.tasks()
      : this.taskService.tasksForProject(projectId);
    return ids
      .map((id) => pool.find((task) => task.id === id) ?? this.taskService.getTask(id))
      .filter((task): task is Task => !!task);
  });
  readonly relatedCandidates = computed(() => {
    const term = this.relatedQuery().toLowerCase().trim();
    const projectId = Number(this.taskForm?.getRawValue()?.projectId);
    const pool = Number.isNaN(projectId)
      ? this.taskService.tasks()
      : this.taskService.tasksForProject(projectId);
    const selected = new Set(this.relatedIds());
    return pool.filter((task) => {
      if (task.id === this.taskId || selected.has(task.id)) return false;
      if (!term) return true;
      return task.title.toLowerCase().includes(term);
    });
  });

  toggleRelated(taskId: string): void {
    this.relatedIds.update((ids) =>
      ids.includes(taskId) ? ids.filter((id) => id !== taskId) : [...ids, taskId],
    );
  }

  toggleTag(tagId: number): void {
    this.selectedTagIds.update((ids) =>
      ids.includes(tagId) ? ids.filter((id) => id !== tagId) : [...ids, tagId],
    );
  }

  createTag(): void {
    const projectId = Number(this.taskForm.getRawValue().projectId);
    const name = this.tagDraft.trim();
    if (!name || Number.isNaN(projectId)) return;
    this.tagService.getOrCreateTag(projectId, name, this.tagColor).subscribe((tag) => {
      if (!tag) return;
      this.tagDraft = '';
      this.selectedTagIds.update((ids) => (ids.includes(tag.id) ? ids : [...ids, tag.id]));
    });
  }

  addTrackedTime(): void {
    if (!this.taskId) return;
    const hours = Number(this.addTimeDraft);
    if (!Number.isFinite(hours) || hours <= 0) return;
    const current = this.currentTask()?.timeTracked ?? 0;
    this.taskService.updateTask(this.taskId, { timeTracked: current + Math.round(hours) }).subscribe((ok) => {
      if (ok) {
        this.addTimeDraft = '';
        this.taskService.getTaskById(this.taskId!).subscribe((task) => {
          if (task) this.currentTask.set(task);
        });
      }
    });
  }

  addComment(): void {
    if (!this.taskId || !this.commentDraft.trim()) return;
    this.taskService
      .updateTask(this.taskId, { activityComment: this.commentDraft.trim() })
      .subscribe((ok) => {
        if (!ok) return;
        this.commentDraft = '';
        this.taskService.getTaskById(this.taskId!).subscribe((task) => {
          if (task) this.currentTask.set(task);
        });
      });
  }

  onFileSelected(event: Event): void {
    if (!this.taskId) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.taskService.uploadTaskFile(this.taskId, file).subscribe((attachment) => {
      input.value = '';
      if (attachment) {
        this.taskService.getTaskById(this.taskId!).subscribe((task) => {
          if (task) this.currentTask.set(task);
        });
      }
    });
  }

  downloadFile(attachmentId: number, name: string): void {
    if (!this.taskId) return;
    this.taskService.downloadTaskFile(this.taskId, attachmentId).subscribe((blob) => {
      if (!blob || typeof window === 'undefined') return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  deleteFile(attachmentId: number): void {
    if (!this.taskId) return;
    this.taskService.deleteTaskFile(this.taskId, attachmentId).subscribe((ok) => {
      if (!ok) return;
      const current = this.currentTask();
      if (current) {
        this.currentTask.set({
          ...current,
          attachments: current.attachments.filter((item) => item.id !== attachmentId),
        });
      }
    });
  }

  submit(): void {
    this.error = '';
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    if (this.submitting) return;
    this.submitting = true;

    const formValue = this.taskForm.getRawValue();
    const projectId = Number(formValue.projectId);
    if (Number.isNaN(projectId)) {
      this.submitting = false;
      this.error = 'Select a project for this task.';
      return;
    }

    const payload = {
      title: formValue.title.trim(),
      description: formValue.description.trim() || undefined,
      priority: formValue.priority,
      status: formValue.status,
      taskType: formValue.taskType,
      projectId,
      sprintId: this.sprintId,
      userIds: Array.from(this.selectedUserIds()).filter((uid) => uid?.trim()),
      tagIds: this.selectedTagIds(),
      dueDate: formValue.dueDate || null,
      timeEstimate: toNullableNumber(formValue.timeEstimate),
      sprintPoints: toNullableNumber(formValue.sprintPoints),
      relatedTasks: serializeRelatedTaskIds(this.relatedIds()),
    };

    if (this.taskId) {
      this.taskService.updateTask(this.taskId, payload).subscribe({
        next: (ok) => {
          this.submitting = false;
          if (ok) this.navigateAfterSave(projectId, this.sprintId);
          else this.error = 'Could not update task. Try again.';
        },
        error: () => {
          this.submitting = false;
          this.error = 'Could not update task. Try again.';
        },
      });
    } else {
      this.taskService.addTask(payload).subscribe({
        next: (task) => {
          this.submitting = false;
          if (task) this.navigateAfterSave(projectId, this.sprintId);
          else this.error = 'Could not add task. Try again.';
        },
        error: () => {
          this.submitting = false;
          this.error = 'Could not add task. Try again.';
        },
      });
    }
  }

  getInitial = getInitial;
  getAvatarColor = getAvatarColor;

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.users().filter((u) => u.id?.trim());
    if (!term) return list;
    return list.filter((u) => u.fullName.toLowerCase().includes(term));
  });

  projectLabel(): string {
    const id = this.taskForm?.getRawValue()?.projectId as number | null | undefined;
    if (id === null || id === undefined || Number.isNaN(Number(id))) return '—';
    const p = this.projectService.projects().find((x) => x.id === id);
    return p?.title ?? `#${id}`;
  }

  taskListBackLink(): string {
    const id = this.taskForm.getRawValue().projectId as number | null;
    if (id !== null && !Number.isNaN(Number(id))) {
      if (this.sprintId != null) return `/project/${id}/sprint/${this.sprintId}`;
      return `/project/${id}/backlog`;
    }
    return '/project/list';
  }

  private navigateAfterSave(projectId: number, sprintId: number | null): void {
    if (sprintId != null) {
      this.router.navigate(['/project', projectId, 'sprint', sprintId]);
    } else {
      this.router.navigate(['/project', projectId, 'backlog']);
    }
  }
}

function toNullableNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
