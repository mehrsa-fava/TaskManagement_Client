export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  /** @deprecated Use status instead. Kept for migration only. */
  completed?: boolean;
  description?: string;
  dueDate?: number;
  priority: TaskPriority;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export type AddTaskInput = {
  title: string;
  description?: string;
  dueDate?: number;
  priority?: TaskPriority;
  category?: string;
  status?: TaskStatus;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  dueDate?: number;
  priority?: TaskPriority;
  category?: string;
  status?: TaskStatus;
};

/** Options for status and priority selects (shared by form and list). */
export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];
