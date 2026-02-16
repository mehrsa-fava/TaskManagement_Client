import { Component, computed, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../services/task-service';
import { AuthService } from '../services/auth-service';
import { formatShortDate } from '../utils/date.util';
import type { Task } from '../model/task';

export type TaskListFilter = 'all' | 'active' | 'completed';

const FILTER_TABS: { value: TaskListFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

@Component({
  selector: 'app-task-list',
  imports: [RouterLink],
  templateUrl: './task-list.html',
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
    if (f === 'active') return tasks.filter((t) => t.status !== 'Completed');
    if (f === 'completed') return tasks.filter((t) => t.status === 'Completed');
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
}
