import { Injectable, signal, computed } from '@angular/core';
import type { User } from '../model/user';

const STORAGE_KEY = 'taskmanager_user';
const EMPLOYEE_ROLE = 'Employee';

function normalizeRoles(roles: unknown): string[] {
  if (Array.isArray(roles)) {
    return roles.filter(
      (role): role is string => typeof role === 'string' && role.trim().length > 0,
    );
  }
  if (typeof roles === 'string' && roles.trim().length > 0) {
    return [roles.trim()];
  }
  return [];
}

function extractRoles(raw: unknown): string[] {
  if (!raw || typeof raw !== 'object') return [];
  const u = raw as Record<string, unknown>;
  const rawRoles = u['roles'] ?? u['Roles'] ?? u['role'] ?? u['Role'];
  return normalizeRoles(rawRoles);
}

function withNormalizedRoles(user: User): User {
  const extracted = extractRoles(user);
  return { ...user, roles: extracted.length > 0 ? extracted : normalizeRoles(user.roles) };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userSignal = signal<User | null>(this.loadStoredUser());

  readonly currentUser = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.userSignal() !== null);
  readonly roles = computed(() => this.userSignal()?.roles ?? []);
  readonly isEmployee = computed(() => this.hasRole(EMPLOYEE_ROLE));
  /** Employees can open tasks but cannot create or edit projects/sprints. */
  readonly canManageWorkspace = computed(() => !this.isEmployee());
  readonly canCreateProject = computed(() => !this.isEmployee());
  readonly canCreateSprint = computed(() => !this.isEmployee());

  getToken(): string | null {
    return this.userSignal()?.token ?? null;
  }

  hasRole(role: string): boolean {
    const target = role.trim().toLowerCase();
    if (!target) return false;
    return this.roles().some((r) => r.trim().toLowerCase() === target);
  }

  setUser(user: User): void {
    const existing = this.userSignal();
    const incomingRoles = extractRoles(user);
    const existingRoles = existing?.roles ?? [];
    const roles = incomingRoles.length > 0 ? incomingRoles : existingRoles;
    const next: User = { ...user, roles };
    this.userSignal.set(next);
    this.persist(next);
  }

  logout(): void {
    this.userSignal.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as User;
      if (!parsed?.token || !parsed?.refreshToken) {
        return null;
      }
      return withNormalizedRoles(parsed);
    } catch {
      return null;
    }
  }

  private persist(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  }
}
