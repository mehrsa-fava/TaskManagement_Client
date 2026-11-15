import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import type { TagColor, TaskTag } from '../model/tag';
import type { TagApiDto } from '../model/task-api';
import { apiToTag, tagColorToApi } from './task-api.mappers';
import { getApiErrorMessage } from '../utils/api-error.util';

const TAG_BASE = `${environment.api}/Tag`;

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly tagsByProjectSignal = signal<Record<number, TaskTag[]>>({});
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  readonly tagsByProject = this.tagsByProjectSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  tagsForProject(projectId: number): TaskTag[] {
    return this.tagsByProjectSignal()[projectId] ?? [];
  }

  loadTags(projectId: number): Observable<TaskTag[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http
      .get<TagApiDto[]>(`${TAG_BASE}/GetAllTagsByProjectId`, { params: { projectId } })
      .pipe(
        tap(() => this.loadingSignal.set(false)),
        catchError((err) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(getApiErrorMessage(err, 'Failed to load tags'));
          return of([]);
        }),
        map((list) => (list ?? []).map(apiToTag)),
        tap((tags) => {
          this.tagsByProjectSignal.update((map) => ({ ...map, [projectId]: tags }));
          this.errorSignal.set(null);
        }),
      );
  }

  getOrCreateTag(projectId: number, tagName: string, tagColor: TagColor): Observable<TaskTag | null> {
    const body = {
      ProjectId: projectId,
      TagName: tagName,
      TagColor: tagColorToApi(tagColor),
    };
    return this.http.post<TagApiDto>(`${TAG_BASE}/GetOrCreateTag`, body).pipe(
      map(apiToTag),
      tap((tag) => {
        this.tagsByProjectSignal.update((map) => {
          const current = map[projectId] ?? [];
          if (current.some((item) => item.id === tag.id)) return map;
          return { ...map, [projectId]: [...current, tag] };
        });
      }),
      catchError(() => of(null)),
    );
  }
}
