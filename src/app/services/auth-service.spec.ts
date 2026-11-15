import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth-service';
import type { User } from '../model/user';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and initial user is null', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.isEmployee()).toBe(false);
    expect(service.canManageWorkspace()).toBe(true);
  });

  it('should handle Employee role from login/refresh-token payload', () => {
    const loginUser: User = {
      id: '2b5b3489-f1d9-400d-b64a-ed06cbbd52c7',
      userName: 'maryam_45789',
      email: 'maryam45789@gmail.com',
      token: 'jwt-token-123',
      refreshToken: 'refresh-token-123',
      refreshTokenExpiresAt: '2026-09-05T05:45:25.8737843Z',
      roles: ['Employee'],
    };

    service.setUser(loginUser);

    expect(service.isLoggedIn()).toBe(true);
    expect(service.roles()).toEqual(['Employee']);
    expect(service.hasRole('Employee')).toBe(true);
    expect(service.hasRole('employee')).toBe(true);
    expect(service.isEmployee()).toBe(true);
    expect(service.canManageWorkspace()).toBe(false);
    expect(service.canCreateProject()).toBe(false);
    expect(service.canCreateSprint()).toBe(false);
  });

  it('should allow workspace management for non-employee roles (e.g. Admin)', () => {
    const adminUser: User = {
      id: 'admin-123',
      userName: 'admin_user',
      email: 'admin@gmail.com',
      token: 'jwt-token-admin',
      refreshToken: 'refresh-token-admin',
      refreshTokenExpiresAt: '2026-09-05T05:45:25.8737843Z',
      roles: ['Admin'],
    };

    service.setUser(adminUser);

    expect(service.isLoggedIn()).toBe(true);
    expect(service.roles()).toEqual(['Admin']);
    expect(service.isEmployee()).toBe(false);
    expect(service.canManageWorkspace()).toBe(true);
    expect(service.canCreateProject()).toBe(true);
    expect(service.canCreateSprint()).toBe(true);
  });

  it('should persist user with normalized roles in localStorage and restore it', () => {
    const employeeUser: User = {
      id: 'emp-123',
      userName: 'emp_user',
      email: 'emp@gmail.com',
      token: 'jwt-token-emp',
      refreshToken: 'refresh-token-emp',
      refreshTokenExpiresAt: '2026-09-05T05:45:25.8737843Z',
      roles: ['Employee'],
    };

    service.setUser(employeeUser);

    // Re-create service instance to simulate page reload
    const reloadedService = TestBed.runInInjectionContext(() => new AuthService());
    expect(reloadedService.isLoggedIn()).toBe(true);
    expect(reloadedService.isEmployee()).toBe(true);
    expect(reloadedService.roles()).toEqual(['Employee']);
  });

  it('should logout and clear stored user', () => {
    service.setUser({
      id: 'emp-123',
      userName: 'emp_user',
      email: 'emp@gmail.com',
      token: 'token',
      refreshToken: 'refresh',
      refreshTokenExpiresAt: '2026-09-05T05:45:25.8737843Z',
      roles: ['Employee'],
    });

    expect(service.isLoggedIn()).toBe(true);

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.roles()).toEqual([]);
    expect(service.isEmployee()).toBe(false);
  });
});
