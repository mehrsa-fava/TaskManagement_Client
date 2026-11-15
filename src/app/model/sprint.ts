export interface Sprint {
  id: number;
  title: string;
  projectId: number;
  startDate: string;
  endDate: string;
  goal: string;
  tasks?: unknown[];
}

export interface CreateSprintInput {
  title: string;
  startDate: string;
  endDate: string;
  goal: string;
  projectId: number;
}

export interface UpdateSprintInput {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  goal: string;
}

export interface CreateSprintApiResponse {
  id: number;
  success: boolean;
  message: string;
  errors: string[];
}
