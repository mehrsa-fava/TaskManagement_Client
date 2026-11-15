import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskBoard } from './task-board';

describe('TaskBoard', () => {
  let fixture: ComponentFixture<TaskBoard>;
  let component: TaskBoard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', [
      { status: 'Open', tasks: [] },
      { status: 'InProgress', tasks: [] },
    ]);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
