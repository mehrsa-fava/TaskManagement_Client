/** API DTOs and enum values matching the backend (C#). */

export const TaskStatusApi = {
  Open: 0,
  InProgress: 1,
  Complete: 2,
  InReview: 3,
  Accept: 4,
  Reject: 5,
  Done: 6,
  Pending: 7,
  Block: 8,
} as const;

export const TaskPriorityApi = {
  Low: 0,
  Medium: 1,
  High: 2,
  Urgent: 3,
} as const;

export const TaskTypeApi = {
  Task: 0,
  Bug: 1,
  MeetingNote: 2,
} as const;

export const TagColorApi = {
  Red: 0,
  Green: 1,
  Blue: 2,
  Yellow: 3,
  Pink: 4,
  Purple: 5,
  Brown: 6,
  Black: 7,
} as const;

export interface CreateTaskDto {
  Title: string;
  Description: string;
  Priority: number;
  Status: number;
  TaskType?: number;
  ProjectId: number;
  SprintId: number | null;
  UserIds: string[];
  TagIds: number[];
  SprintPoints: number | null;
  TimeEstimate: number | null;
  TimeTracked: number | null;
  DueDate: string | null;
  RelatedTasks: string | null;
}

export interface UpdateTaskDto {
  Id: number;
  Title: string;
  Description: string;
  Priority: number;
  Status: number;
  TaskType?: number;
  UserIds: string[];
  TagIds: number[];
  SprintPoints: number | null;
  TimeEstimate: number | null;
  TimeTracked: number | null;
  DueDate: string | null;
  RelatedTasks: string | null;
  Activity?: string | null;
}

export interface MoveTasksDto {
  ProjectId: number;
  SprintId: number | null;
  TaskIds: number[];
}

export interface ChangeTasksStatusDto {
  ProjectId: number;
  TaskIds: number[];
  Status: number;
}

export interface CommandApiResponse {
  id?: number;
  Id?: number;
  success?: boolean;
  Success?: boolean;
  message?: string;
  Message?: string;
  errors?: string[];
  Errors?: string[];
}

export interface UserDto {
  id: string;
  fullName: string;
}

export interface TagApiDto {
  id?: number;
  Id?: number;
  tagName?: string;
  TagName?: string;
  tagColor?: number | string;
  TagColor?: number | string;
}

export interface AttachmentApiDto {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
  taskId?: number;
  TaskId?: number;
}

export interface TaskApiResponse {
  Id?: number;
  id?: number;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  Priority?: number | string;
  priority?: number | string;
  Users?: UserDto[];
  users?: UserDto[];
  Status?: number | string;
  status?: number | string;
  TaskType?: number | string;
  taskType?: number | string;
  ProjectId?: number;
  projectId?: number;
  SprintId?: number | null;
  sprintId?: number | null;
  Tags?: TagApiDto[];
  tags?: TagApiDto[];
  Attachments?: AttachmentApiDto[];
  attachments?: AttachmentApiDto[];
  SprintPoints?: number | null;
  sprintPoints?: number | null;
  TimeEstimate?: number | null;
  timeEstimate?: number | null;
  TimeTracked?: number | null;
  timeTracked?: number | null;
  DueDate?: string | null;
  dueDate?: string | null;
  Activity?: string | null;
  activity?: string | null;
  RelatedTasks?: string | null;
  relatedTasks?: string | null;
  CreatedAt?: string;
  createdAt?: string;
  UpdatedAt?: string;
  updatedAt?: string;
}
