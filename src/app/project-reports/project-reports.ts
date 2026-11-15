import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { Task } from '../model/task';
import type { Sprint } from '../model/sprint';
import type { ProjectReport } from '../model/report';
import {
  BOARD_STATUS_ORDER,
  FINISHED_STATUSES,
  statusChartColor,
  statusLabel,
} from '../utils/task-status.util';
import { formatHours } from '../utils/hours.util';
import { getAvatarColor, getInitial } from '../utils/avatar.util';

interface Slice {
  label: string;
  value: number;
  color: string;
  path: string;
  percent: number;
}

interface BarPoint {
  label: string;
  values: { value: number; color: string; label: string }[];
}

interface LineChart {
  labels: string[];
  series: { color: string; dashed?: boolean; points: string; dots: { x: number; y: number }[] }[];
  max: number;
}

@Component({
  selector: 'app-project-reports',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './project-reports.html',
  styleUrl: './project-reports.css',
})
export class ProjectReports {
  readonly report = input<ProjectReport | null>(null);
  readonly tasks = input<Task[]>([]);
  readonly sprints = input<Sprint[]>([]);
  readonly sprintId = input<number | null>(null);
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly formatHours = formatHours;
  readonly getInitial = getInitial;
  readonly getAvatarColor = getAvatarColor;
  readonly statusLabel = statusLabel;

  readonly scopedTasks = computed(() => {
    const sprintId = this.sprintId();
    if (sprintId == null) return this.tasks();
    return this.tasks().filter((task) => task.sprintId === sprintId);
  });

  readonly workloadBars = computed(() => {
    const fromApi = this.report()?.workloadByStatus ?? [];
    const source =
      fromApi.length > 0
        ? fromApi
        : BOARD_STATUS_ORDER.map((status) => ({
            status,
            count: this.tasks().filter((task) => task.status === status).length,
          }));
    const max = Math.max(1, ...source.map((row) => row.count));
    return source.map((row) => ({
      ...row,
      label: statusLabel(row.status),
      value: row.count,
      color: statusChartColor(row.status),
      height: (row.count / max) * 100,
    }));
  });

  readonly workloadPie = computed(() => this.toDonut(this.workloadBars(), 90, 70, false));

  readonly assigneePie = computed(() => {
    const tasks = this.tasks();
    const counts = new Map<string, { name: string; count: number }>();
    let unassigned = 0;
    for (const task of tasks) {
      if (!task.users.length) {
        unassigned += 1;
        continue;
      }
      for (const user of task.users) {
        const current = counts.get(user.id) ?? { name: user.fullName, count: 0 };
        current.count += 1;
        counts.set(user.id, current);
      }
    }
    const rows = [...counts.values()].map((row, index) => ({
      label: row.name,
      value: row.count,
      color: ['#475569', '#64748b', '#94a3b8', '#0f172a'][index % 4],
    }));
    if (unassigned > 0) rows.push({ label: 'Unassigned', value: unassigned, color: '#cbd5e1' });
    return this.toDonut(rows, 90, 70, false);
  });

  readonly sprintStatusDonut = computed(() => {
    const grouped = BOARD_STATUS_ORDER.map((status) => ({
      label: statusLabel(status),
      value: this.scopedTasks().filter((task) => task.status === status).length,
      color: statusChartColor(status),
    })).filter((row) => row.value > 0);
    return this.toDonut(grouped, 90, 58, true);
  });

  readonly estimateVsActual = computed((): BarPoint[] => {
    return this.sprints().map((sprint, index) => {
      const sprintTasks = this.tasks().filter((task) => task.sprintId === sprint.id);
      return {
        label: sprint.title || `Sprint ${index + 1}`,
        values: [
          {
            label: 'Estimated hours',
            value: sprintTasks.reduce((sum, task) => sum + (task.timeEstimate ?? 0), 0),
            color: '#1d4ed8',
          },
          {
            label: 'Tracked hours',
            value: sprintTasks.reduce((sum, task) => sum + (task.timeTracked ?? 0), 0),
            color: '#15803d',
          },
        ],
      };
    });
  });

  readonly estimateMax = computed(() => {
    const values = this.estimateVsActual().flatMap((row) => row.values.map((item) => item.value));
    return Math.max(10, ...values, 1);
  });

  readonly accuracyRows = computed(() =>
    this.estimateVsActual().map((row) => {
      const estimated = row.values[0]?.value ?? 0;
      const tracked = row.values[1]?.value ?? 0;
      const accuracy = estimated > 0 ? Math.round((tracked / estimated) * 100) : null;
      return { label: row.label, estimated, tracked, accuracy };
    }),
  );

  readonly timeRows = computed(() => {
    const byUser = new Map<
      string,
      { name: string; estimated: number; tracked: number; tasks: Task[] }
    >();
    for (const task of this.tasks()) {
      if (!task.users.length) continue;
      for (const user of task.users) {
        const current = byUser.get(user.id) ?? {
          name: user.fullName,
          estimated: 0,
          tracked: 0,
          tasks: [],
        };
        current.estimated += task.timeEstimate ?? 0;
        current.tracked += task.timeTracked ?? 0;
        current.tasks.push(task);
        byUser.set(user.id, current);
      }
    }
    const fromApi = this.report()?.timeTrackedByUser ?? [];
    if (fromApi.length && byUser.size === 0) {
      return fromApi.map((row) => ({
        userId: row.userId,
        name: row.fullName,
        estimated: row.timeEstimatedHours ?? 0,
        tracked: row.timeTrackedHours,
        tasks: [] as Task[],
      }));
    }
    return [...byUser.entries()].map(([userId, row]) => ({ userId, ...row }));
  });

  readonly velocityChart = computed((): LineChart => {
    const points = this.sprints().map((sprint) => {
      const sprintTasks = this.tasks().filter((task) => task.sprintId === sprint.id);
      const completed = sprintTasks
        .filter((task) => FINISHED_STATUSES.includes(task.status))
        .reduce((sum, task) => sum + (task.sprintPoints ?? 0), 0);
      const committed = sprintTasks.reduce((sum, task) => sum + (task.sprintPoints ?? 0), 0);
      return { label: sprint.title, completed, committed };
    });
    const max = Math.max(10, ...points.flatMap((row) => [row.completed, row.committed]), 1);
    return this.toLine(
      points.map((row) => row.label),
      [
        { color: '#93c5fd', values: points.map((row) => row.committed) },
        { color: '#2563eb', values: points.map((row) => row.completed) },
      ],
      max,
    );
  });

  readonly burnCharts = computed(() => {
    const sprintId = this.sprintId();
    const sprints = this.sprints();
    const sprint =
      sprintId != null ? sprints.find((item) => item.id === sprintId) : sprints[sprints.length - 1];
    if (!sprint?.startDate || !sprint?.endDate) {
      return { burnup: null as LineChart | null, burndown: null as LineChart | null, summary: null };
    }
    const days = this.enumerateDays(sprint.startDate, sprint.endDate);
    const sprintTasks = this.tasks().filter((task) => task.sprintId === sprint.id);
    const total = sprintTasks.reduce((sum, task) => sum + (task.sprintPoints ?? 1), 0);
    const completedByDay = days.map((day, index) => {
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      const done = sprintTasks
        .filter(
          (task) => FINISHED_STATUSES.includes(task.status) && task.updatedAt <= end.getTime(),
        )
        .reduce((sum, task) => sum + (task.sprintPoints ?? 1), 0);
      const idealUp = days.length > 1 ? (total * index) / (days.length - 1) : total;
      const idealDown = total - idealUp;
      return { label: this.shortDay(day), done, remaining: Math.max(0, total - done), idealUp, idealDown };
    });
    const started = sprintTasks.filter((task) => task.status !== 'Open').reduce(
      (sum, task) => sum + (task.sprintPoints ?? 1),
      0,
    );
    const completed = sprintTasks
      .filter((task) => FINISHED_STATUSES.includes(task.status))
      .reduce((sum, task) => sum + (task.sprintPoints ?? 1), 0);
    const max = Math.max(total, 10);
    return {
      summary: {
        total,
        started,
        completed,
        startedPct: total ? Math.round((started / total) * 100) : 0,
        completedPct: total ? Math.round((completed / total) * 100) : 0,
      },
      burnup: this.toLine(
        completedByDay.map((row) => row.label),
        [
          { color: '#94a3b8', values: completedByDay.map((row) => row.idealUp), dashed: true },
          { color: '#2563eb', values: completedByDay.map((row) => row.done) },
        ],
        max,
      ),
      burndown: this.toLine(
        completedByDay.map((row) => row.label),
        [
          { color: '#94a3b8', values: completedByDay.map((row) => row.idealDown), dashed: true },
          { color: '#2563eb', values: completedByDay.map((row) => row.remaining) },
        ],
        max,
      ),
    };
  });

  readonly velocitySummary = computed(() => {
    const chart = this.velocityChart();
    const completed = this.sprints().map((sprint) =>
      this.tasks()
        .filter((task) => task.sprintId === sprint.id && FINISHED_STATUSES.includes(task.status))
        .reduce((sum, task) => sum + (task.sprintPoints ?? 0), 0),
    );
    const avg = completed.length ? Math.round(completed.reduce((a, b) => a + b, 0) / completed.length) : 0;
    const forecast =
      this.sprints().reduce((sum, sprint) => {
        return (
          sum +
          this.tasks()
            .filter((task) => task.sprintId === sprint.id)
            .reduce((inner, task) => inner + (task.sprintPoints ?? 0), 0)
        );
      }, 0) / Math.max(this.sprints().length, 1);
    return {
      velocity: avg,
      forecast: Math.round(forecast),
      sprints: this.sprints().length,
      max: chart.max,
    };
  });

  private toDonut(
    rows: { label: string; value: number; color: string }[],
    cx: number,
    cy: number,
    hole: boolean,
  ): { slices: Slice[]; total: number; hole: boolean; cx: number; cy: number } {
    const total = rows.reduce((sum, row) => sum + row.value, 0);
    if (total <= 0) return { slices: [], total: 0, hole, cx, cy };
    let angle = -Math.PI / 2;
    const radius = 52;
    const inner = hole ? 28 : 0;
    const slices = rows
      .filter((row) => row.value > 0)
      .map((row) => {
        const sweep = (row.value / total) * Math.PI * 2;
        const start = angle;
        const end = angle + sweep;
        angle = end;
        return {
          ...row,
          percent: Math.round((row.value / total) * 1000) / 10,
          path: this.arc(cx, cy, radius, inner, start, end),
        };
      });
    return { slices, total, hole, cx, cy };
  }

  private arc(
    cx: number,
    cy: number,
    radius: number,
    inner: number,
    start: number,
    end: number,
  ): string {
    const polar = (r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
    const large = end - start > Math.PI ? 1 : 0;
    const [sx, sy] = polar(radius, start);
    const [ex, ey] = polar(radius, end);
    if (inner <= 0) {
      return `M ${cx} ${cy} L ${sx} ${sy} A ${radius} ${radius} 0 ${large} 1 ${ex} ${ey} Z`;
    }
    const [isx, isy] = polar(inner, end);
    const [iex, iey] = polar(inner, start);
    return `M ${sx} ${sy} A ${radius} ${radius} 0 ${large} 1 ${ex} ${ey} L ${isx} ${isy} A ${inner} ${inner} 0 ${large} 0 ${iex} ${iey} Z`;
  }

  private toLine(
    labels: string[],
    series: { color: string; values: number[]; dashed?: boolean }[],
    max: number,
  ): LineChart {
    const width = 320;
    const height = 160;
    const padX = 24;
    const padY = 16;
    const count = Math.max(labels.length, 1);
    const xAt = (index: number) =>
      padX + (count === 1 ? width / 2 : (index / (count - 1)) * (width - padX * 2));
    const yAt = (value: number) => padY + (1 - value / max) * (height - padY * 2);
    return {
      labels,
      max,
      series: series.map((item) => ({
        color: item.color,
        dashed: item.dashed,
        points: item.values.map((value, index) => `${xAt(index)},${yAt(value)}`).join(' '),
        dots: item.values.map((value, index) => ({ x: xAt(index), y: yAt(value) })),
      })),
    };
  }

  private enumerateDays(startIso: string, endIso: string): string[] {
    const start = new Date(startIso.slice(0, 10) + 'T00:00:00');
    const end = new Date(endIso.slice(0, 10) + 'T00:00:00');
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
    const days: string[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  private shortDay(iso: string): string {
    const date = new Date(iso + 'T00:00:00');
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  barHeight(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }
}
