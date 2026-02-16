import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../services/task-service';
import {
  type Task,
  type TaskStatus,
  type TaskPriority,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from '../model/task';

@Component({
  selector: 'app-task-form',
  imports: [RouterLink, FormsModule],
  templateUrl: './task-form.html',
})
export class TaskForm implements OnInit {
  title = '';
  description = '';
  dueDateInput = '';
  priority: TaskPriority = 'Medium';
  category = '';
  status: TaskStatus = 'Open';
  error = '';
  submitting = false;
  readonly isEditMode = signal(false);
  private taskId: string | null = null;

  readonly statusOptions = TASK_STATUS_OPTIONS;
  readonly priorityOptions = TASK_PRIORITY_OPTIONS;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      let task = this.taskService.getTask(id);
      if (task) {
        this.setFormFromTask(task);
        this.taskId = id;
        this.isEditMode.set(true);
      } else {
        this.taskService.getTaskById(id).subscribe((t) => {
          if (t) {
            this.setFormFromTask(t);
            this.taskId = id;
            this.isEditMode.set(true);
          }
        });
      }
    }
  }

  private setFormFromTask(task: Task): void {
    this.title = task.title;
    this.description = task.description ?? '';
    this.priority = task.priority;
    this.category = task.category ?? '';
    this.status = task.status;
    this.dueDateInput =
      task.dueDate != null
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : '';
  }

  private resetForm(): void {
    this.title = '';
    this.description = '';
    this.dueDateInput = '';
    this.priority = 'Medium';
    this.category = '';
    this.status = 'Open';
  }

  submit(): void {
    this.error = '';
    const t = this.title.trim();
    if (!t) {
      this.error = 'Please enter a task title.';
      return;
    }
    if (this.submitting) return;
    this.submitting = true;

    const payload = {
      title: t,
      description: this.description.trim() || undefined,
      priority: this.priority,
      status: this.status,
    };

    if (this.taskId) {
      this.taskService.updateTask(this.taskId, payload).subscribe({
        next: (ok) => {
          this.submitting = false;
          if (ok) this.router.navigate(['/task/list']);
          else this.error = 'Could not update task. Try again.';
        },
        error: () => {
          this.submitting = false;
          this.error = 'Could not update task. Try again.';
        },
      });
    } else {
      this.taskService.addTask(payload).subscribe({
        next: (task) => {
          this.submitting = false;
          if (task) {
            this.resetForm();
            this.router.navigate(['/task/list']);
          } else {
            this.error = 'Could not add task. Try again.';
          }
        },
        error: () => {
          this.submitting = false;
          this.error = 'Could not add task. Try again.';
        },
      });
    }
  }
}
