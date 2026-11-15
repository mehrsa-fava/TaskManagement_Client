import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of, map, forkJoin, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, TaskStatus, AddTaskInput, UpdateTaskInput, TaskAttachment } from '../model/task';
import type {
  TaskApiResponse,
  CreateTaskDto,
  UpdateTaskDto,
  CommandApiResponse,
  MoveTasksDto,
  ChangeTasksStatusDto,
  AttachmentApiDto,
} from '../model/task-api';
import type { ProjectBoard, BoardColumn, SprintBoard } from '../model/board';
import { apiToTask, toCreateDto, toUpdateDto, statusToApi } from './task-api.mappers';
import { getApiErrorMessage } from '../utils/api-error.util';
import { pick } from '../utils/pick.util';
import { BOARD_STATUS_ORDER } from '../utils/task-status.util';

const TASK_BASE = `${environment.api}/Task`;

function parseTaskId(id: string): number | null {
  const num = parseInt(id, 10);
  return Number.isNaN(num) ? null : num;
}

export interface TaskListQuery {
  projectId: number;
  tagIds?: number[];
  userIds?: string[];
  sprintId?: number;
  backlog?: boolean;
}

function appendListParams(params: HttpParams, key: string, values?: (string | number)[]): HttpParams {
  if (!values?.length) return params;
  return values.reduce((next, value) => next.append(key, String(value)), params);
}

function commandSucceeded(body: CommandApiResponse | null | undefined): boolean {
  if (!body) return false;
  const success = body.success ?? body.Success;
  if (success === false) return false;
  return true;
}

function commandId(body: CommandApiResponse | null | undefined): number | null {
  const id = body?.id ?? body?.Id;
  if (id == null) return null;
  const n = Number(id);
  return Number.isNaN(n) ? null : n;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly tasksSignal = signal<Task[]>([]);
  private readonly tasksByProjectSignal = signal<Record<number, Task[]>>({});
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  readonly tasks = this.tasksSignal.asReadonly();
  readonly tasksByProject = this.tasksByProjectSignal.asReadonly();
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

  /** Loads tasks for a single project (backend: GetAllTasksByProjectId). */
  loadTasksByProjectId(query: number | TaskListQuery): Observable<Task[]> {
    const options: TaskListQuery = typeof query === 'number' ? { projectId: query } : query;
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    let params = new HttpParams().set('projectId', String(options.projectId));
    params = appendListParams(params, 'tagIds', options.tagIds);
    params = appendListParams(params, 'userIds', options.userIds);
    if (options.sprintId != null) params = params.set('sprintId', String(options.sprintId));
    if (options.backlog) params = params.set('backlog', 'true');

    return this.http
      .get<TaskApiResponse[] | TaskApiResponse>(`${TASK_BASE}/GetAllTasksByProjectId`, { params })
      .pipe(
        tap(() => this.loadingSignal.set(false)),
        catchError((err) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(getApiErrorMessage(err, 'Failed to load tasks'));
          return of([]);
        }),
        map((body) => {
          const list = Array.isArray(body) ? body : body ? [body as TaskApiResponse] : [];
          return list.map(apiToTask);
        }),
        tap((tasks) => {
          this.tasksSignal.set(tasks);
          this.tasksByProjectSignal.update((map) => ({ ...map, [options.projectId]: tasks }));
          this.errorSignal.set(null);
        }),
      );
  }

  /** Loads tasks into the per-project cache without replacing the active task list. */
  loadProjectTasksCache(projectId: number): Observable<Task[]> {
    return this.http
      .get<TaskApiResponse[] | TaskApiResponse>(`${TASK_BASE}/GetAllTasksByProjectId`, {
        params: { projectId },
      })
      .pipe(
        catchError(() => of([])),
        map((body) => {
          const list = Array.isArray(body) ? body : body ? [body as TaskApiResponse] : [];
          return list.map(apiToTask);
        }),
        tap((tasks) => {
          this.tasksByProjectSignal.update((map) => ({ ...map, [projectId]: tasks }));
        }),
      );
  }

  loadBoard(projectId: number, filters?: { tagIds?: number[]; userIds?: string[] }): Observable<ProjectBoard> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    let params = new HttpParams().set('projectId', String(projectId));
    params = appendListParams(params, 'tagIds', filters?.tagIds);
    params = appendListParams(params, 'userIds', filters?.userIds);

    return this.http.get<unknown>(`${TASK_BASE}/GetBoardByProjectId`, { params }).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError((err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(getApiErrorMessage(err, 'Failed to load board'));
        return of(null);
      }),
      map((body) => this.normalizeBoard(body)),
      tap((board) => {
        const tasks = [
          ...board.backlog.flatMap((column) => column.tasks),
          ...board.sprints.flatMap((sprint) => sprint.columns.flatMap((column) => column.tasks)),
        ];
        this.syncProjectTaskCache(tasks);
        this.errorSignal.set(null);
      }),
    );
  }

  tasksForProject(projectId: number): Task[] {
    return this.tasksByProjectSignal()[projectId] ?? [];
  }

  openTaskCountForSprint(projectId: number, sprintId: number): number {
    return this.tasksForProject(projectId).filter(
      (t) => t.sprintId === sprintId && t.status !== 'Done',
    ).length;
  }

  private syncProjectTaskCache(tasks: Task[]): void {
    const byProject: Record<number, Task[]> = { ...this.tasksByProjectSignal() };
    for (const task of tasks) {
      if (task.projectId === undefined) continue;
      const pid = task.projectId;
      const list = [...(byProject[pid] ?? [])];
      const idx = list.findIndex((t) => t.id === task.id);
      if (idx >= 0) list[idx] = task;
      else list.push(task);
      byProject[pid] = list;
    }
    this.tasksByProjectSignal.set(byProject);
  }

  private removeFromProjectTaskCache(taskId: string, projectId?: number): void {
    if (projectId === undefined) {
      this.tasksByProjectSignal.update((map) => {
        const next = { ...map };
        for (const pid of Object.keys(next)) {
          next[Number(pid)] = next[Number(pid)].filter((t) => t.id !== taskId);
        }
        return next;
      });
      return;
    }

    this.tasksByProjectSignal.update((map) => ({
      ...map,
      [projectId]: (map[projectId] ?? []).filter((t) => t.id !== taskId),
    }));
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
        tap((task) => {
          this.upsertTask(task);
        }),
        catchError(() => of(null)),
      );
  }

  addTask(input: AddTaskInput): Observable<Task | null> {
    const params = input;
    const title = (params.title ?? '').trim();
    if (!title) throw new Error('Task title is required');
    if (params.projectId === undefined || Number.isNaN(Number(params.projectId))) {
      throw new Error('Task projectId is required');
    }

    const dto: CreateTaskDto = toCreateDto(params, title);
    return this.http.post<CommandApiResponse | TaskApiResponse>(`${TASK_BASE}/CreateNewTask`, dto).pipe(
      switchMap((created) => {
        const id = commandId(created as CommandApiResponse);
        if (id != null) return this.getTaskById(String(id));
        const maybeTask = apiToTask(created as TaskApiResponse);
        if (maybeTask.id && maybeTask.title) {
          this.upsertTask(maybeTask);
          return of(maybeTask);
        }
        return of(null);
      }),
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

    return this.http.put<unknown>(`${TASK_BASE}/UpdateTaskById`, dto).pipe(
      tap(() => {
        this.patchLocalTask(id, input);
      }),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  setStatus(id: string, status: TaskStatus): Observable<boolean> {
    const task = this.getTask(id);
    if (task?.projectId != null) {
      return this.changeTasksStatus(task.projectId, [id], status);
    }
    return this.updateTask(id, { status });
  }

  changeTasksStatus(projectId: number, taskIds: string[], status: TaskStatus): Observable<boolean> {
    const dto: ChangeTasksStatusDto = {
      ProjectId: projectId,
      TaskIds: taskIds.map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n)),
      Status: statusToApi(status),
    };
    if (dto.TaskIds.length === 0) return of(false);
    return this.http.put<CommandApiResponse>(`${TASK_BASE}/ChangeTasksStatus`, dto).pipe(
      tap(() => {
        for (const id of taskIds) this.patchLocalTask(id, { status });
      }),
      map((body) => commandSucceeded(body)),
      catchError(() => of(false)),
    );
  }

  moveTasks(projectId: number, taskIds: string[], sprintId: number | null): Observable<boolean> {
    const dto: MoveTasksDto = {
      ProjectId: projectId,
      SprintId: sprintId,
      TaskIds: taskIds.map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n)),
    };
    if (dto.TaskIds.length === 0) return of(false);
    return this.http.put<CommandApiResponse>(`${TASK_BASE}/MoveTasks`, dto).pipe(
      tap(() => {
        for (const id of taskIds) this.patchLocalTask(id, { sprintId });
      }),
      map((body) => commandSucceeded(body)),
      catchError(() => of(false)),
    );
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
        tap(() => {
          const existing = this.getTask(id);
          this.tasksSignal.update((list) => list.filter((t) => t.id !== id));
          this.removeFromProjectTaskCache(id, existing?.projectId);
        }),
        map(() => true),
        catchError(() => of(false)),
      );
  }

  uploadTaskFile(taskId: string, file: File): Observable<TaskAttachment | null> {
    const numId = parseTaskId(taskId);
    if (numId === null) return of(null);
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http
      .post<AttachmentApiDto>(`${TASK_BASE}/UploadTaskFile`, form, { params: { taskId: numId } })
      .pipe(
        map((body) => {
          const raw = (body ?? {}) as Record<string, unknown>;
          const attachment: TaskAttachment = {
            id: Number(pick(raw, 'id', 'Id') ?? 0),
            name: String(pick(raw, 'name', 'Name') ?? file.name),
            taskId: Number(pick(raw, 'taskId', 'TaskId') ?? numId),
          };
          this.tasksSignal.update((list) =>
            list.map((t) =>
              t.id === taskId ? { ...t, attachments: [...t.attachments, attachment] } : t,
            ),
          );
          return attachment;
        }),
        catchError(() => of(null)),
      );
  }

  downloadTaskFile(taskId: string, attachmentId: number): Observable<Blob | null> {
    const numId = parseTaskId(taskId);
    if (numId === null) return of(null);
    return this.http
      .get(`${TASK_BASE}/DownloadTaskFile`, {
        params: { taskId: numId, id: attachmentId },
        responseType: 'blob',
      })
      .pipe(catchError(() => of(null)));
  }

  deleteTaskFile(taskId: string, attachmentId: number): Observable<boolean> {
    const numId = parseTaskId(taskId);
    if (numId === null) return of(false);
    return this.http
      .delete<unknown>(`${TASK_BASE}/DeleteTaskFile`, {
        params: { taskId: numId, id: attachmentId },
      })
      .pipe(
        tap(() => {
          this.tasksSignal.update((list) =>
            list.map((t) =>
              t.id === taskId
                ? { ...t, attachments: t.attachments.filter((a) => a.id !== attachmentId) }
                : t,
            ),
          );
        }),
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

  private upsertTask(task: Task): void {
    this.tasksSignal.update((list) => {
      const idx = list.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = task;
        return next;
      }
      return [...list, task];
    });
    this.syncProjectTaskCache([task]);
  }

  private patchLocalTask(id: string, input: UpdateTaskInput): void {
    const now = Date.now();
    let updatedTask: Task | undefined;
    this.tasksSignal.update((list) =>
      list.map((t) => {
        if (t.id !== id) return t;
        updatedTask = {
          ...t,
          ...(input.title !== undefined && { title: input.title.trim() }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.priority !== undefined && { priority: input.priority }),
          ...(input.status !== undefined && { status: input.status }),
          ...(input.taskType !== undefined && { taskType: input.taskType }),
          ...(input.projectId !== undefined && { projectId: input.projectId }),
          ...(input.sprintId !== undefined && { sprintId: input.sprintId }),
          ...(input.sprintPoints !== undefined && { sprintPoints: input.sprintPoints }),
          ...(input.timeEstimate !== undefined && { timeEstimate: input.timeEstimate }),
          ...(input.timeTracked !== undefined && { timeTracked: input.timeTracked }),
          ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
          ...(input.relatedTasks !== undefined && { relatedTasks: input.relatedTasks }),
          ...(input.userIds !== undefined && {
            users: t.users.filter((u) => input.userIds!.includes(u.id)),
          }),
          updatedAt: now,
        };
        return updatedTask;
      }),
    );
    if (updatedTask) this.syncProjectTaskCache([updatedTask]);
  }

  private normalizeBoard(body: unknown): ProjectBoard {
    const raw = (body ?? {}) as Record<string, unknown>;
    const backlog = pick<unknown[]>(raw, 'backlog', 'Backlog') ?? [];
    const sprints = pick<unknown[]>(raw, 'sprints', 'Sprints') ?? [];
    return {
      backlog: this.normalizeColumns(Array.isArray(backlog) ? backlog : []),
      sprints: (Array.isArray(sprints) ? sprints : []).map((item) => this.normalizeSprintBoard(item)),
    };
  }

  private normalizeSprintBoard(item: unknown): SprintBoard {
    const raw = (item ?? {}) as Record<string, unknown>;
    const start = pick<string>(raw, 'startDate', 'StartDate') ?? '';
    const end = pick<string>(raw, 'endDate', 'EndDate') ?? '';
    return {
      id: Number(pick(raw, 'id', 'Id') ?? 0),
      title: String(pick(raw, 'title', 'Title') ?? 'Sprint'),
      goal: String(pick(raw, 'goal', 'Goal') ?? ''),
      startDate: String(start).slice(0, 10),
      endDate: String(end).slice(0, 10),
      columns: this.normalizeColumns(pick<unknown[]>(raw, 'columns', 'Columns') ?? []),
    };
  }

  private normalizeColumns(columns: unknown[]): BoardColumn[] {
    const mapped = columns.map((column) => {
      const raw = (column ?? {}) as Record<string, unknown>;
      const tasksRaw = pick<unknown[]>(raw, 'tasks', 'Tasks') ?? [];
      return {
        status: apiToTask({ Status: pick(raw, 'status', 'Status') } as TaskApiResponse).status,
        tasks: (Array.isArray(tasksRaw) ? tasksRaw : []).map((task) =>
          apiToTask(task as TaskApiResponse),
        ),
      } satisfies BoardColumn;
    });
    const byStatus = new Map(mapped.map((column) => [column.status, column.tasks]));
    return BOARD_STATUS_ORDER.map((status) => ({
      status,
      tasks: byStatus.get(status) ?? [],
    }));
  }
}
