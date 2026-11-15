import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TagService } from './tag-service';
import { environment } from '../../environments/environment';

describe('TagService', () => {
  let service: TagService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TagService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads project tags', () => {
    service.loadTags(4).subscribe((tags) => {
      expect(tags[0].tagName).toBe('bug');
    });
    const req = httpMock.expectOne(`${environment.api}/Tag/GetAllTagsByProjectId?projectId=4`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, tagName: 'bug', tagColor: 0 }]);
  });
});
