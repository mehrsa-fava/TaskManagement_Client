import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TaskService } from '../services/task-service';
import { ProfileMenu } from '../profile-menu/profile-menu';
import {
  type Task,
  type TaskStatus,
  type TaskPriority,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from '../model/task';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './task-form.html',
})
export class TaskForm implements OnInit {
  taskForm!: FormGroup;

  error = '';
  submitting = false;

  readonly isEditMode = signal(false);
  private taskId: string | null = null;

  readonly statusOptions = TASK_STATUS_OPTIONS;
  readonly priorityOptions = TASK_PRIORITY_OPTIONS;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTask(id);
    }
  }

  private initForm(): void {
    this.taskForm = new FormGroup({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl('', { nonNullable: true }),
      dueDateInput: new FormControl('', { nonNullable: true }),
      priority: new FormControl<TaskPriority>('Medium', { nonNullable: true }),
      category: new FormControl('', { nonNullable: true }),
      status: new FormControl<TaskStatus>('Open', { nonNullable: true }),
    });
  }

  private loadTask(id: string): void {
    const localTask = this.taskService.getTask(id);

    if (localTask) {
      this.applyTask(localTask, id);
    } else {
      this.taskService.getTaskById(id).subscribe((task) => {
        if (task) this.applyTask(task, id);
      });
    }
  }

  private applyTask(task: Task, id: string): void {
    this.taskId = id;
    this.isEditMode.set(true);

    this.taskForm.patchValue({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      category: task.category ?? '',
      status: task.status,
      dueDateInput: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
    });
  }

  private resetForm(): void {
    this.taskForm.reset({
      title: '',
      description: '',
      dueDateInput: '',
      priority: 'Medium',
      category: '',
      status: 'Open',
    });
  }

  submit(): void {
    this.error = '';

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    if (this.submitting) return;
    this.submitting = true;

    const formValue = this.taskForm.getRawValue();

    const payload = {
      title: formValue.title.trim(),
      description: formValue.description.trim() || undefined,
      priority: formValue.priority,
      status: formValue.status,
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
