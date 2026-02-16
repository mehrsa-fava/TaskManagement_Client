import type { Task, TaskStatus, TaskPriority } from '../model/task';
import type { AddTaskInput, UpdateTaskInput } from '../model/task';
import type { TaskApiResponse, CreateTaskDto, UpdateTaskDto } from '../model/task-api';
import {
  TaskStatusApi,
  TaskPriorityApi,
} from '../model/task-api';

export function statusFromApi(n: number): TaskStatus {
  switch (n) {
    case TaskStatusApi.Todo:
      return 'todo';
    case TaskStatusApi.InProgress:
      return 'in_progress';
    case TaskStatusApi.Completed:
      return 'completed';
    default:
      return 'todo';
  }
}

export function statusToApi(s: TaskStatus): number {
  switch (s) {
    case 'todo':
      return TaskStatusApi.Todo;
    case 'in_progress':
      return TaskStatusApi.InProgress;
    case 'completed':
      return TaskStatusApi.Completed;
    default:
      return TaskStatusApi.Todo;
  }
}

export function priorityFromApi(n: number): TaskPriority {
  switch (n) {
    case TaskPriorityApi.Low:
      return 'low';
    case TaskPriorityApi.Medium:
      return 'medium';
    case TaskPriorityApi.High:
      return 'high';
    default:
      return 'medium';
  }
}

export function priorityToApi(p: TaskPriority): number {
  switch (p) {
    case 'low':
      return TaskPriorityApi.Low;
    case 'medium':
      return TaskPriorityApi.Medium;
    case 'high':
      return TaskPriorityApi.High;
    default:
      return TaskPriorityApi.Medium;
  }
}

/** Supports both PascalCase (C#) and camelCase (JSON) response shapes. */
export function apiToTask(api: TaskApiResponse): Task {
  const now = Date.now();
  const raw = api as unknown as Record<string, unknown>;
  const id = api.Id ?? raw['id'];
  const title = api.Title ?? raw['title'];
  const status = api.Status ?? raw['status'];
  const priority = api.Priority ?? raw['priority'];
  const description = api.Description ?? raw['description'];
  const createdAt = api.CreatedAt ?? raw['createdAt'];
  const updatedAt = api.UpdatedAt ?? raw['updatedAt'];
  return {
    id: String(id),
    title: (title ?? '') as string,
    status: statusFromApi(Number(status)),
    description: (description ?? '') as string,
    priority: priorityFromApi(Number(priority)),
    createdAt: createdAt ? new Date(createdAt as string).getTime() : now,
    updatedAt: updatedAt ? new Date(updatedAt as string).getTime() : now,
  };
}

export function toCreateDto(params: AddTaskInput, title: string): CreateTaskDto {
  return {
    Title: title,
    Description: params.description ?? '',
    Priority: priorityToApi(params.priority ?? 'medium'),
    Status: statusToApi(params.status ?? 'todo'),
  };
}

export function toUpdateDto(
  id: number,
  input: UpdateTaskInput,
  existing: Pick<Task, 'title' | 'description' | 'priority' | 'status'> | undefined
): UpdateTaskDto {
  return {
    Id: id,
    Title: (input.title ?? existing?.title ?? '').trim(),
    Description: input.description ?? existing?.description ?? '',
    Priority: priorityToApi(input.priority ?? existing?.priority ?? 'medium'),
    Status: statusToApi(input.status ?? existing?.status ?? 'todo'),
  };
}
