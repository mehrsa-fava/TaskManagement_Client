import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import type { TaskUser } from '../model/task';
import { getApiErrorMessage } from '../utils/api-error.util';

const TASK_BASE = `${environment.api}/Task`;

@Injectable({
  providedIn: 'root',
})
export class TaskUserService {
  private readonly http = inject(HttpClient);

  private readonly usersSignal = signal<TaskUser[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly users = this.usersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  loadUsers(): Observable<TaskUser[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<TaskUser[]>(`${TASK_BASE}/GetAllUsers`, {}).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError((err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(getApiErrorMessage(err, 'Failed to load users'));
        return of([]);
      }),
      tap((users) => {
        this.usersSignal.set(users ?? []);
      }),
    );
  }
}
