import type { TaskStatus } from './task';

export interface StatusCount {
  status: TaskStatus;
  count: number;
}

export interface UserTime {
  userId: string;
  fullName: string;
  timeTrackedHours: number;
  timeEstimatedHours?: number;
  taskCount: number;
}

export interface ProjectReport {
  projectId: number;
  totalTasks: number;
  activeCount: number;
  finishedCount: number;
  workloadByStatus: StatusCount[];
  timeTrackedByUser: UserTime[];
}
