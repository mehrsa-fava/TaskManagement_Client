import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskUser,
  TaskAttachment,
  AddTaskInput,
  UpdateTaskInput,
} from '../model/task';
import type { TaskTag, TagColor } from '../model/tag';
import type {
  TaskApiResponse,
  CreateTaskDto,
  UpdateTaskDto,
  TagApiDto,
  AttachmentApiDto,
} from '../model/task-api';
import { TaskStatusApi, TaskPriorityApi, TaskTypeApi, TagColorApi } from '../model/task-api';
import { pick } from '../utils/pick.util';

const STATUS_BY_NAME: Record<string, TaskStatus> = {
  open: 'Open',
  inprogress: 'InProgress',
  complete: 'Completed',
  completed: 'Completed',
  inreview: 'InReview',
  accept: 'Accept',
  reject: 'Reject',
  done: 'Done',
  pending: 'Pending',
  block: 'Block',
};

const PRIORITY_BY_NAME: Record<string, TaskPriority> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const TYPE_BY_NAME: Record<string, TaskType> = {
  task: 'Task',
  bug: 'Bug',
  meetingnote: 'MeetingNote',
};

const COLOR_BY_NAME: Record<string, TagColor> = {
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
  yellow: 'Yellow',
  pink: 'Pink',
  purple: 'Purple',
  brown: 'Brown',
  black: 'Black',
};

function normalizeKey(value: string): string {
  return value.replace(/[\s_-]/g, '').toLowerCase();
}

export function statusFromApi(value: unknown): TaskStatus {
  if (typeof value === 'string' && Number.isNaN(Number(value))) {
    return STATUS_BY_NAME[normalizeKey(value)] ?? 'Open';
  }
  switch (Number(value)) {
    case TaskStatusApi.Open:
      return 'Open';
    case TaskStatusApi.InProgress:
      return 'InProgress';
    case TaskStatusApi.Complete:
      return 'Completed';
    case TaskStatusApi.InReview:
      return 'InReview';
    case TaskStatusApi.Accept:
      return 'Accept';
    case TaskStatusApi.Reject:
      return 'Reject';
    case TaskStatusApi.Done:
      return 'Done';
    case TaskStatusApi.Pending:
      return 'Pending';
    case TaskStatusApi.Block:
      return 'Block';
    default:
      return 'Open';
  }
}

export function statusToApi(s: TaskStatus): number {
  switch (s) {
    case 'Open':
      return TaskStatusApi.Open;
    case 'InProgress':
      return TaskStatusApi.InProgress;
    case 'Completed':
      return TaskStatusApi.Complete;
    case 'InReview':
      return TaskStatusApi.InReview;
    case 'Accept':
      return TaskStatusApi.Accept;
    case 'Reject':
      return TaskStatusApi.Reject;
    case 'Done':
      return TaskStatusApi.Done;
    case 'Pending':
      return TaskStatusApi.Pending;
    case 'Block':
      return TaskStatusApi.Block;
    default:
      return TaskStatusApi.Open;
  }
}

export function priorityFromApi(value: unknown): TaskPriority {
  if (typeof value === 'string' && Number.isNaN(Number(value))) {
    return PRIORITY_BY_NAME[normalizeKey(value)] ?? 'Medium';
  }
  switch (Number(value)) {
    case TaskPriorityApi.Low:
      return 'Low';
    case TaskPriorityApi.Medium:
      return 'Medium';
    case TaskPriorityApi.High:
      return 'High';
    case TaskPriorityApi.Urgent:
      return 'Urgent';
    default:
      return 'Medium';
  }
}

export function priorityToApi(p: TaskPriority): number {
  switch (p) {
    case 'Low':
      return TaskPriorityApi.Low;
    case 'Medium':
      return TaskPriorityApi.Medium;
    case 'High':
      return TaskPriorityApi.High;
    case 'Urgent':
      return TaskPriorityApi.Urgent;
    default:
      return TaskPriorityApi.Medium;
  }
}

export function taskTypeFromApi(value: unknown): TaskType {
  if (value == null) return 'Task';
  if (typeof value === 'string' && Number.isNaN(Number(value))) {
    return TYPE_BY_NAME[normalizeKey(value)] ?? 'Task';
  }
  switch (Number(value)) {
    case TaskTypeApi.Bug:
      return 'Bug';
    case TaskTypeApi.MeetingNote:
      return 'MeetingNote';
    default:
      return 'Task';
  }
}

export function taskTypeToApi(type: TaskType): number {
  switch (type) {
    case 'Bug':
      return TaskTypeApi.Bug;
    case 'MeetingNote':
      return TaskTypeApi.MeetingNote;
    default:
      return TaskTypeApi.Task;
  }
}

export function tagColorFromApi(value: unknown): TagColor {
  if (typeof value === 'string' && Number.isNaN(Number(value))) {
    return COLOR_BY_NAME[normalizeKey(value)] ?? 'Blue';
  }
  switch (Number(value)) {
    case TagColorApi.Red:
      return 'Red';
    case TagColorApi.Green:
      return 'Green';
    case TagColorApi.Blue:
      return 'Blue';
    case TagColorApi.Yellow:
      return 'Yellow';
    case TagColorApi.Pink:
      return 'Pink';
    case TagColorApi.Purple:
      return 'Purple';
    case TagColorApi.Brown:
      return 'Brown';
    case TagColorApi.Black:
      return 'Black';
    default:
      return 'Blue';
  }
}

export function tagColorToApi(color: TagColor): number {
  return TagColorApi[color] ?? TagColorApi.Blue;
}

export function apiToTag(api: TagApiDto | Record<string, unknown>): TaskTag {
  const raw = api as Record<string, unknown>;
  return {
    id: Number(pick(raw, 'id', 'Id') ?? 0),
    tagName: String(pick(raw, 'tagName', 'TagName') ?? ''),
    tagColor: tagColorFromApi(pick(raw, 'tagColor', 'TagColor')),
  };
}

function apiToAttachment(api: AttachmentApiDto | Record<string, unknown>): TaskAttachment {
  const raw = api as Record<string, unknown>;
  return {
    id: Number(pick(raw, 'id', 'Id') ?? 0),
    name: String(pick(raw, 'name', 'Name') ?? ''),
    taskId: Number(pick(raw, 'taskId', 'TaskId') ?? 0),
  };
}

/** Supports both PascalCase (C#) and camelCase (JSON) response shapes. */
export function apiToTask(api: TaskApiResponse): Task {
  const now = Date.now();
  const raw = api as unknown as Record<string, unknown>;
  const id = pick(raw, 'Id', 'id');
  const title = pick(raw, 'Title', 'title');
  const status = pick(raw, 'Status', 'status');
  const priority = pick(raw, 'Priority', 'priority');
  const description = pick(raw, 'Description', 'description');
  const users = pick<unknown[]>(raw, 'Users', 'users');
  const tags = pick<unknown[]>(raw, 'Tags', 'tags');
  const attachments = pick<unknown[]>(raw, 'Attachments', 'attachments');
  const projectIdRaw = pick(raw, 'ProjectId', 'projectId');
  const projectId =
    projectIdRaw === undefined || projectIdRaw === null ? undefined : Number(projectIdRaw);
  const sprintIdRaw = pick(raw, 'SprintId', 'sprintId');
  const sprintId =
    sprintIdRaw === undefined || sprintIdRaw === null ? null : Number(sprintIdRaw);
  const createdAt = pick<string>(raw, 'CreatedAt', 'createdAt');
  const updatedAt = pick<string>(raw, 'UpdatedAt', 'updatedAt');
  const dueDateRaw = pick<string>(raw, 'DueDate', 'dueDate');
  return {
    id: String(id ?? ''),
    title: String(title ?? ''),
    status: statusFromApi(status),
    taskType: taskTypeFromApi(pick(raw, 'TaskType', 'taskType')),
    description: String(description ?? ''),
    priority: priorityFromApi(priority),
    users: Array.isArray(users) ? normalizeUsers(users as Record<string, unknown>[]) : [],
    tags: Array.isArray(tags) ? tags.map((tag) => apiToTag(tag as Record<string, unknown>)) : [],
    attachments: Array.isArray(attachments)
      ? attachments.map((item) => apiToAttachment(item as Record<string, unknown>))
      : [],
    ...(projectId !== undefined && !Number.isNaN(projectId) ? { projectId } : {}),
    sprintId: sprintId !== null && !Number.isNaN(sprintId) ? sprintId : null,
    sprintPoints: toNullableNumber(pick(raw, 'SprintPoints', 'sprintPoints')),
    timeEstimate: toNullableNumber(pick(raw, 'TimeEstimate', 'timeEstimate')),
    timeTracked: toNullableNumber(pick(raw, 'TimeTracked', 'timeTracked')),
    dueDate: dueDateRaw ? String(dueDateRaw).slice(0, 10) : null,
    activity: (pick<string | null>(raw, 'Activity', 'activity') ?? null) as string | null,
    relatedTasks: (pick<string | null>(raw, 'RelatedTasks', 'relatedTasks') ?? null) as
      | string
      | null,
    createdAt: createdAt ? new Date(createdAt).getTime() : now,
    updatedAt: updatedAt ? new Date(updatedAt).getTime() : now,
  };
}

function toNullableNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function normalizeUsers(rows: Record<string, unknown>[]): TaskUser[] {
  return rows.map((row) => {
    const id = row['id'] ?? row['Id'];
    const fullName = row['fullName'] ?? row['FullName'];
    return {
      id: String(id ?? ''),
      fullName: String(fullName ?? 'Unknown User'),
    };
  });
}

export function toCreateDto(params: AddTaskInput, title: string): CreateTaskDto {
  return {
    Title: title,
    Description: params.description ?? '',
    Priority: priorityToApi(params.priority ?? 'Medium'),
    Status: statusToApi(params.status ?? 'Open'),
    TaskType: taskTypeToApi(params.taskType ?? 'Task'),
    ProjectId: params.projectId,
    SprintId: params.sprintId ?? null,
    UserIds: (params.userIds ?? []).filter((uid) => uid?.trim()),
    TagIds: params.tagIds ?? [],
    SprintPoints: params.sprintPoints ?? null,
    TimeEstimate: params.timeEstimate ?? null,
    TimeTracked: params.timeTracked ?? null,
    DueDate: params.dueDate ?? null,
    RelatedTasks: params.relatedTasks ?? null,
  };
}

export function toUpdateDto(
  id: number,
  input: UpdateTaskInput,
  existing: Task | undefined,
): UpdateTaskDto {
  const rawUserIds = input.userIds ?? (existing?.users ?? []).map((u) => u.id);
  const tagIds = input.tagIds ?? (existing?.tags ?? []).map((t) => t.id);
  return {
    Id: id,
    Title: (input.title ?? existing?.title ?? '').trim(),
    Description: input.description ?? existing?.description ?? '',
    Priority: priorityToApi(input.priority ?? existing?.priority ?? 'Medium'),
    Status: statusToApi(input.status ?? existing?.status ?? 'Open'),
    TaskType: taskTypeToApi(input.taskType ?? existing?.taskType ?? 'Task'),
    UserIds: rawUserIds.filter((uid) => uid?.trim()),
    TagIds: tagIds,
    SprintPoints: input.sprintPoints !== undefined ? input.sprintPoints : (existing?.sprintPoints ?? null),
    TimeEstimate: input.timeEstimate !== undefined ? input.timeEstimate : (existing?.timeEstimate ?? null),
    TimeTracked: input.timeTracked !== undefined ? input.timeTracked : (existing?.timeTracked ?? null),
    DueDate: input.dueDate !== undefined ? input.dueDate : (existing?.dueDate ?? null),
    RelatedTasks:
      input.relatedTasks !== undefined ? input.relatedTasks : (existing?.relatedTasks ?? null),
    ...(input.activityComment ? { Activity: input.activityComment } : {}),
  };
}
