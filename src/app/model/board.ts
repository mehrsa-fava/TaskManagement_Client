import type { Task, TaskStatus } from './task';

export interface BoardColumn {
  status: TaskStatus;
  tasks: Task[];
}

export interface SprintBoard {
  id: number;
  title: string;
  goal: string;
  startDate: string;
  endDate: string;
  columns: BoardColumn[];
}

export interface ProjectBoard {
  backlog: BoardColumn[];
  sprints: SprintBoard[];
}
