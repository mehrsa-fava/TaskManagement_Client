import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ReportService } from './report-service';
import { environment } from '../../environments/environment';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads project workload from the report API', () => {
    service.loadProjectWorkload(7).subscribe((report) => {
      expect(report?.totalTasks).toBe(12);
      expect(report?.workloadByStatus.some((row) => row.status === 'Open' && row.count === 3)).toBe(
        true,
      );
    });
    const req = httpMock.expectOne(`${environment.api}/Report/GetProjectWorkload?projectId=7`);
    expect(req.request.method).toBe('GET');
    req.flush({
      projectId: 7,
      totalTasks: 12,
      activeCount: 8,
      finishedCount: 4,
      workloadByStatus: [{ status: 'Open', count: 3 }],
      timeTrackedByUser: [],
    });
  });
});
