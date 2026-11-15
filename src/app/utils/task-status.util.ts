import type { TaskPriority, TaskStatus } from '../model/task';

export const BOARD_STATUS_ORDER: TaskStatus[] = [
  'Open',
  'Pending',
  'InProgress',
  'Completed',
  'InReview',
  'Accept',
  'Reject',
  'Block',
  'Done',
];

export const FINISHED_STATUSES: TaskStatus[] = ['Completed', 'InReview', 'Accept', 'Done'];
export const ACTIVE_STATUSES: TaskStatus[] = ['Open', 'InProgress', 'Pending', 'Block', 'Reject'];

export function statusLabel(status: TaskStatus): string {
  switch (status) {
    case 'Open':
      return 'Open';
    case 'Pending':
      return 'Pending';
    case 'InProgress':
      return 'In Progress';
    case 'Completed':
      return 'Completed';
    case 'InReview':
      return 'In Review';
    case 'Accept':
      return 'Accepted';
    case 'Reject':
      return 'Rejected';
    case 'Block':
      return 'Blocked';
    case 'Done':
      return 'Closed';
    default:
      return status;
  }
}

export function statusHeaderClass(status: TaskStatus): string {
  switch (status) {
    case 'Open':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'InProgress':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'Completed':
      return 'bg-zinc-800 text-white border-zinc-800';
    case 'InReview':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Accept':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'Reject':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Block':
      return 'bg-violet-100 text-violet-800 border-violet-200';
    case 'Done':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function statusDotClass(status: TaskStatus): string {
  switch (status) {
    case 'Open':
      return 'bg-slate-400';
    case 'Pending':
      return 'bg-amber-400';
    case 'InProgress':
      return 'bg-pink-500';
    case 'Completed':
      return 'bg-zinc-800';
    case 'InReview':
      return 'bg-orange-500';
    case 'Accept':
      return 'bg-rose-600';
    case 'Reject':
      return 'bg-purple-500';
    case 'Block':
      return 'bg-violet-500';
    case 'Done':
      return 'bg-emerald-500';
    default:
      return 'bg-slate-400';
  }
}

export function statusChartColor(status: TaskStatus): string {
  switch (status) {
    case 'Open':
      return '#94a3b8';
    case 'Pending':
      return '#f59e0b';
    case 'InProgress':
      return '#ec4899';
    case 'Completed':
      return '#18181b';
    case 'InReview':
      return '#f97316';
    case 'Accept':
      return '#e11d48';
    case 'Reject':
      return '#a855f7';
    case 'Block':
      return '#8b5cf6';
    case 'Done':
      return '#10b981';
    default:
      return '#94a3b8';
  }
}

export function priorityColorClass(priority: TaskPriority): string {
  switch (priority) {
    case 'Low':
      return 'text-slate-400';
    case 'Medium':
      return 'text-slate-500';
    case 'High':
      return 'text-yellow-500';
    case 'Urgent':
      return 'text-red-500';
    default:
      return 'text-slate-500';
  }
}

export function tagColorClass(color: string): string {
  switch (color) {
    case 'Red':
      return 'bg-red-100 text-red-800';
    case 'Green':
      return 'bg-emerald-100 text-emerald-800';
    case 'Blue':
      return 'bg-sky-100 text-sky-800';
    case 'Yellow':
      return 'bg-amber-100 text-amber-800';
    case 'Pink':
      return 'bg-pink-100 text-pink-800';
    case 'Purple':
      return 'bg-purple-100 text-purple-800';
    case 'Brown':
      return 'bg-orange-100 text-orange-900';
    case 'Black':
      return 'bg-slate-800 text-white';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}
