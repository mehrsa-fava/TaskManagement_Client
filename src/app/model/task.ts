import type { TaskTag } from './tag';

export type TaskStatus =
  | 'Open'
  | 'InProgress'
  | 'Completed'
  | 'InReview'
  | 'Accept'
  | 'Reject'
  | 'Done'
  | 'Pending'
  | 'Block';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskType = 'Task' | 'Bug' | 'MeetingNote';

export interface TaskUser {
  id: string;
  fullName: string;
}

export interface TaskAttachment {
  id: number;
  name: string;
  taskId: number;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  taskType: TaskType;
  /** @deprecated Use status instead. Kept for migration only. */
  completed?: boolean;
  description?: string;
  priority: TaskPriority;
  createdAt: number;
  updatedAt: number;
  users: TaskUser[];
  tags: TaskTag[];
  attachments: TaskAttachment[];
  projectId?: number;
  sprintId?: number | null;
  sprintPoints?: number | null;
  timeEstimate?: number | null;
  timeTracked?: number | null;
  dueDate?: string | null;
  activity?: string | null;
  relatedTasks?: string | null;
}

export type AddTaskInput = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  taskType?: TaskType;
  userIds?: string[];
  tagIds?: number[];
  projectId: number;
  sprintId?: number | null;
  sprintPoints?: number | null;
  timeEstimate?: number | null;
  timeTracked?: number | null;
  dueDate?: string | null;
  relatedTasks?: string | null;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  taskType?: TaskType;
  userIds?: string[];
  tagIds?: number[];
  projectId?: number;
  sprintId?: number | null;
  sprintPoints?: number | null;
  timeEstimate?: number | null;
  timeTracked?: number | null;
  dueDate?: string | null;
  relatedTasks?: string | null;
  activityComment?: string | null;
};

/** Options for status and priority selects (shared by form and list). */
export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'Open', label: 'Open' },
  { value: 'Pending', label: 'Pending' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'InReview', label: 'In Review' },
  { value: 'Accept', label: 'Accepted' },
  { value: 'Reject', label: 'Rejected' },
  { value: 'Block', label: 'Blocked' },
  { value: 'Done', label: 'Closed' },
];

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' },
];

export const TASK_TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: 'Task', label: 'Task' },
  { value: 'Bug', label: 'Bug' },
  { value: 'MeetingNote', label: 'Meeting note' },
];
