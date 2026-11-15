import { apiToTask, statusFromApi, statusToApi, toCreateDto, toUpdateDto } from './task-api.mappers';
import type { Task } from '../model/task';

describe('task-api mappers', () => {
  it('maps Complete from the API to Completed in the view', () => {
    expect(statusFromApi(2)).toBe('Completed');
    expect(statusFromApi('Complete')).toBe('Completed');
    expect(statusToApi('Completed')).toBe(2);
  });

  it('maps time, tags, related tasks, and attachments', () => {
    const task = apiToTask({
      id: 12,
      title: 'Board card',
      status: 'InProgress',
      priority: 'Urgent',
      timeEstimate: 8,
      timeTracked: 5,
      relatedTasks: '3,4',
      tags: [{ id: 9, tagName: 'taga', tagColor: 'Pink' }],
      attachments: [{ id: 1, name: 'spec.pdf', taskId: 12 }],
      users: [{ id: 'u1', fullName: 'Ada' }],
    });

    expect(task.timeEstimate).toBe(8);
    expect(task.timeTracked).toBe(5);
    expect(task.relatedTasks).toBe('3,4');
    expect(task.tags[0].tagName).toBe('taga');
    expect(task.attachments[0].name).toBe('spec.pdf');
    expect(task.users[0].fullName).toBe('Ada');
  });

  it('keeps existing hours when building an update DTO', () => {
    const existing = {
      id: '1',
      title: 'Keep me',
      description: '',
      priority: 'Medium',
      status: 'Open',
      taskType: 'Task',
      users: [],
      tags: [{ id: 2, tagName: 'x', tagColor: 'Blue' }],
      attachments: [],
      timeEstimate: 10,
      timeTracked: 4,
      createdAt: 0,
      updatedAt: 0,
    } as Task;
    const dto = toUpdateDto(1, { title: 'Keep me' }, existing);
    expect(dto.TimeEstimate).toBe(10);
    expect(dto.TimeTracked).toBe(4);
    expect(dto.TagIds).toEqual([2]);
  });

  it('sends new task hours on create', () => {
    const dto = toCreateDto(
      { title: 'New', projectId: 3, timeEstimate: 6, tagIds: [1] },
      'New',
    );
    expect(dto.ProjectId).toBe(3);
    expect(dto.TimeEstimate).toBe(6);
    expect(dto.TagIds).toEqual([1]);
  });
});
