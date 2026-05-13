export interface Project {
  id: number;
  title: string;
  userIds: string[];
}

export interface CreateProjectInput {
  title: string;
  userIds: string[];
}

export interface UpdateProjectInput {
  id: number;
  title: string;
  userIds: string[];
}

export interface CreateProjectApiResponse {
  id: number;
  success: boolean;
  message: string;
  errors: string[];
}
