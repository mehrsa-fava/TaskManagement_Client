import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, TaskStatus, AddTaskInput, UpdateTaskInput } from '../model/task';
import type { TaskApiResponse, CreateTaskDto, UpdateTaskDto } from '../model/task-api';
import { apiToTask, toCreateDto, toUpdateDto } from './task-api.mappers';
import { getApiErrorMessage } from '../utils/api-error.util';

const TASK_BASE = `${environment.api}/Task`;

function parseTaskId(id: string): number | null {
  const num = parseInt(id, 10);
  return Number.isNaN(num) ? null : num;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly tasksSignal = signal<Task[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  readonly tasks = this.tasksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly completedCount = computed(
    () => this.tasksSignal().filter((t) => t.status === 'Done').length,
  );
  readonly activeCount = computed(
    () => this.tasksSignal().filter((t) => t.status !== 'Done').length,
  );

  loadTasks(): Observable<Task[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.get<TaskApiResponse[]>(`${TASK_BASE}/GetAllTasks`).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError((err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(getApiErrorMessage(err, 'Failed to load tasks'));
        return of([]);
      }),
      map((list) => (list ?? []).map(apiToTask)),
      tap((tasks) => {
        this.tasksSignal.set(tasks);
        this.errorSignal.set(null);
      }),
    );
  }

  getTask(id: string): Task | undefined {
    return this.tasksSignal().find((t) => t.id === id);
  }

  getTaskById(id: string): Observable<Task | null> {
    const numId = parseTaskId(id);
    if (numId === null) return of(null);
    return this.http
      .get<TaskApiResponse>(`${TASK_BASE}/GetTaskById`, { params: { id: numId } })
      .pipe(
        map(apiToTask),
        catchError(() => of(null)),
      );
  }

  addTask(input: AddTaskInput | string): Observable<Task | null> {
    const params: AddTaskInput = typeof input === 'string' ? { title: input } : input;
    const title = (params.title ?? '').trim();
    if (!title) throw new Error('Task title is required');

    const dto: CreateTaskDto = toCreateDto(params, title);
    return this.http.post<TaskApiResponse>(`${TASK_BASE}/CreateNewTask`, dto).pipe(
      tap((created) => this.tasksSignal.update((list) => [...list, apiToTask(created)])),
      map(apiToTask),
      catchError(() => of(null)),
    );
  }

  updateTask(id: string, input: UpdateTaskInput): Observable<boolean> {
    const numId = parseTaskId(id);
    if (numId === null) return of(false);
    if (input.title !== undefined && !input.title?.trim()) {
      throw new Error('Task title is required');
    }

    const existing = this.getTask(id);
    const dto: UpdateTaskDto = toUpdateDto(numId, input, existing);
    const now = Date.now();

    return this.http.put<unknown>(`${TASK_BASE}/UpdateTaskById`, dto).pipe(
      tap(() =>
        this.tasksSignal.update((list) =>
          list.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...(input.title !== undefined && { title: input.title.trim() }),
                  ...(input.description !== undefined && {
                    description: input.description,
                  }),
                  ...(input.priority !== undefined && { priority: input.priority }),
                  ...(input.status !== undefined && { status: input.status }),
                  updatedAt: now,
                }
              : t,
          ),
        ),
      ),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  setStatus(id: string, status: TaskStatus): Observable<boolean> {
    return this.updateTask(id, { status });
  }

  toggleCompleted(id: string): Observable<boolean> {
    const task = this.getTask(id);
    if (!task) return of(false);
    const nextStatus: TaskStatus = task.status === 'Done' ? 'Open' : 'Done';
    return this.setStatus(id, nextStatus);
  }

  deleteTask(id: string): Observable<boolean> {
    const numId = parseTaskId(id);
    if (numId === null) return of(false);
    return this.http
      .delete<unknown>(`${TASK_BASE}/DeleteTaskById`, {
        params: { id: numId },
      })
      .pipe(
        tap(() => this.tasksSignal.update((list) => list.filter((t) => t.id !== id))),
        map(() => true),
        catchError(() => of(false)),
      );
  }

  clearCompleted(): Observable<boolean> {
    const completed = this.tasksSignal().filter((t) => t.status === 'Done');
    if (completed.length === 0) return of(true);
    return forkJoin(completed.map((t) => this.deleteTask(t.id))).pipe(
      map((results) => results.every(Boolean)),
      catchError(() => of(false)),
    );
  }
}
