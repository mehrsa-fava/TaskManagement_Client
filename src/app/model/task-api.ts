/** API DTOs and enum values matching the backend (C#). */

export const TaskStatusApi = {
  Todo: 0,
  InProgress: 1,
  Completed: 2,
} as const;

export const TaskPriorityApi = {
  Low: 0,
  Medium: 1,
  High: 2,
} as const;

/** Request/response use PascalCase to match C# DTOs if API does not use camelCase. */
export interface CreateTaskDto {
  Title: string;
  Description: string;
  Priority: number;
  Status: number;
}

export interface UpdateTaskDto {
  Id: number;
  Title: string;
  Description: string;
  Priority: number;
  Status: number;
}

export interface TaskApiResponse {
  Id: number;
  Title: string;
  Description?: string;
  Priority: number;
  Status: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}
