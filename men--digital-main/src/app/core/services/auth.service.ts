import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { delay, map, of, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthCredentials, AuthResponse } from '../models/auth.model';
import { User } from '../models/user.model';
import { InMemoryDatabaseService } from './in-memory-database.service';

const TOKEN_STORAGE_KEY = 'menu-digital.token';
const USER_STORAGE_KEY = 'menu-digital.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly db = inject(InMemoryDatabaseService);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly useMockData = environment.useMockData;

  private readonly currentUserSignal = signal<User | null>(this.restoreUserFromStorage());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  login(credentials: AuthCredentials) {
    if (this.shouldUseMock()) {
      const validUser = this.db
        .users()
        .find(
          (user) =>
            user.username === credentials.username &&
            user.companyId === credentials.companyId &&
            user.active
        );

      const passwordMatches = credentials.password === 'admin123';

      if (!validUser || !passwordMatches) {
        return throwError(() => new Error('Credenciales inválidas'));
      }

      this.persistSession('mock-token', validUser);
      return of(validUser).pipe(delay(150));
    }

    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response) => this.persistSession(response.token, response.user)),
      map((response) => response.user)
    );
  }

  logout() {
    if (this.canUseBrowserStorage()) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    this.currentUserSignal.set(null);
    return this.router.navigate(['/login']);
  }

  getToken() {
    if (!this.canUseBrowserStorage()) {
      return null;
    }

    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  isLoggedIn() {
    return !!this.currentUserSignal();
  }

  private persistSession(token: string, user: User) {
    if (this.canUseBrowserStorage()) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
    this.currentUserSignal.set(user);
  }

  private restoreUserFromStorage(): User | null {
    if (!this.canUseBrowserStorage()) {
      return null;
    }

    const raw = localStorage.getItem(USER_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch (error) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  }

  private canUseBrowserStorage() {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private shouldUseMock() {
    return this.useMockData || !this.canUseBrowserStorage();
  }
}
