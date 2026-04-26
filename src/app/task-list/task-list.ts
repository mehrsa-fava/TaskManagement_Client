import { Component, computed, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../services/task-service';
import { AuthService } from '../services/auth-service';
import { formatShortDate } from '../utils/date.util';
import type { Task, TaskStatus, TaskPriority } from '../model/task';
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '../model/task';

export type TaskListFilter = 'all' | 'active' | 'completed';

const FILTER_TABS: { value: TaskListFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export type EditingField = 'title' | 'description' | 'status' | 'priority' | null;

@Component({
  selector: 'app-task-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private readonly filterSignal = signal<TaskListFilter>('all');

  constructor(
    protected taskService: TaskService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  readonly filterTabs = FILTER_TABS;
  readonly filter = this.filterSignal.asReadonly();
  readonly filteredTasks = computed(() => {
    const tasks = this.taskService.tasks();
    const f = this.filterSignal();
    if (f === 'active') return tasks.filter((t) => t.status !== 'Done');
    if (f === 'completed') return tasks.filter((t) => t.status === 'Done');
    return tasks;
  });

  ngOnInit(): void {
    this.taskService.loadTasks().subscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  setFilter(value: TaskListFilter | string): void {
    this.filterSignal.set(value as TaskListFilter);
  }

  isCompleted(task: Task): boolean {
    return task.status === 'Done';
  }

  formatDueDate = formatShortDate;

  toggle(task: Task): void {
    this.taskService.toggleCompleted(task.id).subscribe();
  }

  delete(task: Task): void {
    this.taskService.deleteTask(task.id).subscribe();
  }

  clearCompleted(): void {
    this.taskService.clearCompleted().subscribe();
  }

  // ─── Inline Editing State ───

  readonly editingTaskId = signal<string | null>(null);
  readonly editingField = signal<EditingField>(null);
  readonly editValue = signal<string>('');

  readonly statusOptions = TASK_STATUS_OPTIONS;
  readonly priorityOptions = TASK_PRIORITY_OPTIONS;

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
    }
  }

  cancelEdit(): void {
    this.editingTaskId.set(null);
    this.editingField.set(null);
    this.editValue.set('');
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
      this.taskService
        .updateTask(taskId, { status: value as TaskStatus })
        .subscribe(() => this.cancelEdit());
    } else if (field === 'priority') {
      this.taskService
        .updateTask(taskId, { priority: value as TaskPriority })
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

  selectStatus(taskId: string, status: TaskStatus): void {
    this.editValue.set(status);
    this.saveEdit(taskId);
  }

  selectPriority(taskId: string, priority: TaskPriority): void {
    this.editValue.set(priority);
    this.saveEdit(taskId);
  }

  // ─── Status Color Helpers ───

  statusBgClass(status: TaskStatus): string {
    switch (status) {
      case 'Open':
        return 'bg-slate-100';
      case 'InProgress':
        return 'bg-amber-100';
      case 'Completed':
        return 'bg-emerald-100';
      case 'InReview':
        return 'bg-indigo-100';
      case 'Accept':
        return 'bg-purple-100';
      case 'Reject':
        return 'bg-red-100';
      case 'Done':
        return 'bg-green-100';
      case 'Pending':
        return 'bg-blue-100';
      case 'Block':
        return 'bg-gray-100';
      default:
        return 'bg-slate-100';
    }
  }

  statusTextClass(status: TaskStatus): string {
    switch (status) {
      case 'Open':
        return 'text-slate-700';
      case 'InProgress':
        return 'text-amber-800';
      case 'Completed':
        return 'text-emerald-800';
      case 'InReview':
        return 'text-indigo-800';
      case 'Accept':
        return 'text-purple-800';
      case 'Reject':
        return 'text-red-800';
      case 'Done':
        return 'text-green-800';
      case 'Pending':
        return 'text-blue-800';
      case 'Block':
        return 'text-gray-800';
      default:
        return 'text-slate-700';
    }
  }

  priorityColorClass(priority: TaskPriority): string {
    switch (priority) {
      case 'Low':
        return 'text-slate-400';
      case 'Medium':
        return 'text-slate-500';
      case 'High':
        return 'text-yellow-500';
      case 'Urgent':
        return 'text-red-500';
      default:
        return 'text-slate-500';
    }
  }
}
