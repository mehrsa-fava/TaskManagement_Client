export interface User {
  id: string | null;
  userName: string | null;
  email: string | null;
  token: string | null;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  result: User | null;
}

export interface RegisterResponse {
  statusCode: number;
  message: string;
}
