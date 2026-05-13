import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  CreateProjectApiResponse,
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '../model/project';
import { getApiErrorMessage } from '../utils/api-error.util';

const PROJECT_BASE = `${environment.api}/Project`;

function normalizeProject(raw: Record<string, unknown>): Project {
  const id = raw['id'] ?? raw['Id'];
  const title = raw['title'] ?? raw['Title'];
  const userIds = raw['userIds'] ?? raw['UserIds'];
  return {
    id: Number(id),
    title: String(title ?? ''),
    userIds: Array.isArray(userIds) ? (userIds as string[]) : [],
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly projectsSignal = signal<Project[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  readonly projects = this.projectsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  loadProjects(): Observable<Project[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.get<unknown[]>(`${PROJECT_BASE}/GetAllProjects`).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError((err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(getApiErrorMessage(err, 'Failed to load projects'));
        return of([]);
      }),
      map((list) => (list ?? []).map((item) => normalizeProject(item as Record<string, unknown>))),
      tap((projects) => {
        this.projectsSignal.set(projects);
        this.errorSignal.set(null);
      }),
    );
  }

  getProjectById(id: number): Observable<Project | null> {
    return this.http.get<unknown>(`${PROJECT_BASE}/GetProjectById`, { params: { id } }).pipe(
      map((body) => normalizeProject(body as Record<string, unknown>)),
      catchError(() => of(null)),
    );
  }

  createProject(input: CreateProjectInput): Observable<CreateProjectApiResponse | null> {
    const body = { title: input.title.trim(), userIds: input.userIds };
    return this.http.post<CreateProjectApiResponse>(`${PROJECT_BASE}/CreateNewProject`, body).pipe(
      tap((res) => {
        if (res?.success && typeof res.id === 'number') {
          this.projectsSignal.update((list) => [...list, { id: res.id, title: body.title, userIds: [...body.userIds] }]);
        }
      }),
      catchError(() => of(null)),
    );
  }

  updateProject(input: UpdateProjectInput): Observable<boolean> {
    const body = { id: input.id, title: input.title.trim(), userIds: input.userIds };
    return this.http.put<unknown>(`${PROJECT_BASE}/UpdateProjectById`, body).pipe(
      tap(() =>
        this.projectsSignal.update((list) =>
          list.map((p) =>
            p.id === input.id ? { ...p, title: body.title, userIds: [...body.userIds] } : p,
          ),
        ),
      ),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  deleteProject(id: number): Observable<boolean> {
    return this.http.delete<unknown>(`${PROJECT_BASE}/DeleteProjectById`, { params: { id } }).pipe(
      tap(() => this.projectsSignal.update((list) => list.filter((p) => p.id !== id))),
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
