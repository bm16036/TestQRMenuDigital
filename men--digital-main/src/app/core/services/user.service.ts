import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User, UserPayload } from '../models/user.model';
import { InMemoryDatabaseService } from './in-memory-database.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly db = inject(InMemoryDatabaseService);
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;
  private readonly useMockData = environment.useMockData;

  readonly users = this.db.users;

  load(companyId?: string) {
    if (this.shouldUseMock()) {
      const filtered = !companyId
        ? this.db.users()
        : this.db.users().filter((user) => user.companyId === companyId);
      return of(filtered).pipe(delay(100));
    }

    return this.http
      .get<User[]>(this.baseUrl, {
        params: companyId ? { companyId } : undefined
      })
      .pipe(tap((users) => this.db.setUsers(users)));
  }

  create(payload: UserPayload) {
    if (this.shouldUseMock()) {
      const user: User = { id: crypto.randomUUID(), ...payload };
      this.db.upsertUser(user);
      return of(user).pipe(delay(100));
    }

    return this.http.post<User>(this.baseUrl, payload).pipe(tap((user) => this.db.upsertUser(user)));
  }

  update(userId: string, payload: UserPayload) {
    if (this.shouldUseMock()) {
      const user: User = { id: userId, ...payload };
      this.db.upsertUser(user);
      return of(user).pipe(delay(100));
    }

    return this.http.put<User>(`${this.baseUrl}/${userId}`, payload).pipe(
      tap((user) => this.db.upsertUser(user))
    );
  }

  delete(userId: string) {
    if (this.shouldUseMock()) {
      this.db.removeUser(userId);
      return of(void 0).pipe(delay(100));
    }

    return this.http.delete<void>(`${this.baseUrl}/${userId}`).pipe(
      tap(() => this.db.removeUser(userId))
    );
  }

  private shouldUseMock() {
    return this.useMockData || typeof window === 'undefined';
  }
}
