import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TaskUserService } from './task-user-service';
import { environment } from '../../environments/environment';

describe('TaskUserService', () => {
  let service: TaskUserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskUserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load users via POST and update signals', () => {
    const mockUsers = [
      { id: '0b039f0c-7600-b845-5597-874aa8e18ded', fullName: 'Admin Admin' },
      { id: '2e6f1365-2285-700b-abc4-70490da5ec4c', fullName: 'System User' },
    ];

    service.loadUsers().subscribe((users) => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`${environment.api}/Task/GetAllUsers`);
    expect(req.request.method).toBe('POST');
    req.flush(mockUsers);

    expect(service.users()).toEqual(mockUsers);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should handle HTTP error gracefully', () => {
    service.loadUsers().subscribe((users) => {
      expect(users).toEqual([]);
    });

    const req = httpMock.expectOne(`${environment.api}/Task/GetAllUsers`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(service.users()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toContain('Failed to load users');
  });
});
