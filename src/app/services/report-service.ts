import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import type { ProjectReport, StatusCount, UserTime } from '../model/report';
import { statusFromApi } from './task-api.mappers';
import { getApiErrorMessage } from '../utils/api-error.util';
import { pick } from '../utils/pick.util';
import { BOARD_STATUS_ORDER } from '../utils/task-status.util';

const REPORT_BASE = `${environment.api}/Report`;

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly reportSignal = signal<ProjectReport | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  readonly report = this.reportSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  loadProjectWorkload(projectId: number): Observable<ProjectReport | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http
      .get<unknown>(`${REPORT_BASE}/GetProjectWorkload`, { params: { projectId } })
      .pipe(
        tap(() => this.loadingSignal.set(false)),
        catchError((err) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(getApiErrorMessage(err, 'Failed to load report'));
          return of(null);
        }),
        map((body) => (body ? this.normalizeReport(body, projectId) : null)),
        tap((report) => {
          this.reportSignal.set(report);
          if (report) this.errorSignal.set(null);
        }),
      );
  }

  private normalizeReport(body: unknown, projectId: number): ProjectReport {
    const raw = body as Record<string, unknown>;
    const workloadRaw = pick<unknown[]>(raw, 'workloadByStatus', 'WorkloadByStatus') ?? [];
    const timeRaw = pick<unknown[]>(raw, 'timeTrackedByUser', 'TimeTrackedByUser') ?? [];
    const workload = (Array.isArray(workloadRaw) ? workloadRaw : []).map((item) => {
      const row = item as Record<string, unknown>;
      return {
        status: statusFromApi(pick(row, 'status', 'Status')),
        count: Number(pick(row, 'count', 'Count') ?? 0),
      } satisfies StatusCount;
    });
    const byStatus = new Map(workload.map((row) => [row.status, row.count]));
    return {
      projectId: Number(pick(raw, 'projectId', 'ProjectId') ?? projectId),
      totalTasks: Number(pick(raw, 'totalTasks', 'TotalTasks') ?? 0),
      activeCount: Number(pick(raw, 'activeCount', 'ActiveCount') ?? 0),
      finishedCount: Number(pick(raw, 'finishedCount', 'FinishedCount') ?? 0),
      workloadByStatus: BOARD_STATUS_ORDER.map((status) => ({
        status,
        count: byStatus.get(status) ?? 0,
      })),
      timeTrackedByUser: (Array.isArray(timeRaw) ? timeRaw : []).map((item) => {
        const row = item as Record<string, unknown>;
        return {
          userId: String(pick(row, 'userId', 'UserId') ?? ''),
          fullName: String(pick(row, 'fullName', 'FullName') ?? 'Unknown User'),
          timeTrackedHours: Number(pick(row, 'timeTrackedHours', 'TimeTrackedHours') ?? 0),
          taskCount: Number(pick(row, 'taskCount', 'TaskCount') ?? 0),
        } satisfies UserTime;
      }),
    };
  }
}
