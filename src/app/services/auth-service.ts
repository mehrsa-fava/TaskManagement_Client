import { Injectable, signal, computed } from '@angular/core';
import type { User } from '../model/user';

const STORAGE_KEY = 'taskmanager_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userSignal = signal<User | null>(this.loadStoredUser());

  readonly currentUser = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.userSignal() !== null);

  getToken(): string | null {
    return this.userSignal()?.token ?? null;
  }

  setUser(user: User): void {
    this.userSignal.set(user);
    this.persist(user);
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
      return parsed;
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
