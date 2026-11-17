import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Task, TaskPriority, TaskStatus } from '../model/task';
import type { BoardColumn } from '../model/board';
import {
  BOARD_STATUS_ORDER,
  priorityColorClass,
  statusDotClass,
  statusColumnClass,
  statusHeaderClass,
  statusLabel,
  tagColorClass,
} from '../utils/task-status.util';
import { getAvatarColor, getInitial } from '../utils/avatar.util';
import { formatGregorianAsShamsi } from '../utils/jalali-date.util';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.css',
})
export class TaskBoard {
  @Input({ required: true }) columns: BoardColumn[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Output() statusChange = new EventEmitter<{ taskId: string; status: TaskStatus }>();
  @Output() addTask = new EventEmitter<{ title: string; status: TaskStatus }>();
  @Output() openTask = new EventEmitter<Task>();

  readonly addingStatus = new Set<TaskStatus>();
  draftTitle = '';
  draggingTaskId: string | null = null;

  statusLabel = statusLabel;
  statusHeaderClass = statusHeaderClass;
  statusColumnClass = statusColumnClass;
  statusDotClass = statusDotClass;
  priorityColorClass = priorityColorClass;
  tagColorClass = tagColorClass;
  getInitial = getInitial;
  getAvatarColor = getAvatarColor;
  formatDue = formatGregorianAsShamsi;

  trackColumn(_index: number, column: BoardColumn): TaskStatus {
    return column.status;
  }

  startAdd(status: TaskStatus): void {
    this.addingStatus.clear();
    this.addingStatus.add(status);
    this.draftTitle = '';
  }

  cancelAdd(): void {
    this.addingStatus.clear();
    this.draftTitle = '';
  }

  isAdding(status: TaskStatus): boolean {
    return this.addingStatus.has(status);
  }

  submitAdd(status: TaskStatus): void {
    const title = this.draftTitle.trim();
    if (!title) {
      this.cancelAdd();
      return;
    }
    this.addTask.emit({ title, status });
    this.cancelAdd();
  }

  onDragStart(event: DragEvent, task: Task): void {
    this.draggingTaskId = task.id;
    event.dataTransfer?.setData('text/plain', task.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onDrop(event: DragEvent, status: TaskStatus): void {
    event.preventDefault();
    const taskId = event.dataTransfer?.getData('text/plain') || this.draggingTaskId;
    this.draggingTaskId = null;
    if (!taskId) return;
    const task = this.columns.flatMap((column) => column.tasks).find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    this.statusChange.emit({ taskId, status });
  }

  onCardKeydown(event: KeyboardEvent, task: Task): void {
    const index = BOARD_STATUS_ORDER.indexOf(task.status);
    if (event.key === 'ArrowRight' && index < BOARD_STATUS_ORDER.length - 1) {
      event.preventDefault();
      this.statusChange.emit({ taskId: task.id, status: BOARD_STATUS_ORDER[index + 1] });
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.statusChange.emit({ taskId: task.id, status: BOARD_STATUS_ORDER[index - 1] });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.openTask.emit(task);
    }
  }

  priorityTitle(priority: TaskPriority): string {
    return `${priority} priority`;
  }
}
