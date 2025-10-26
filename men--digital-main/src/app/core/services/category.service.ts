import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Category, CategoryPayload } from '../models/category.model';
import { InMemoryDatabaseService } from './in-memory-database.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly db = inject(InMemoryDatabaseService);
  private readonly baseUrl = `${environment.apiBaseUrl}/categories`;
  private readonly useMockData = environment.useMockData;

  /** Lista reactiva de categorías que utilizan los componentes. */
  readonly categories = this.db.categories;

  load(companyId?: string) {
    if (this.shouldUseMock()) {
      return of(this.filterByCompany(this.db.categories(), companyId)).pipe(delay(100));
    }

    return this.http
      .get<Category[]>(this.baseUrl, {
        params: companyId ? { companyId } : undefined
      })
      .pipe(
        tap((categories) => this.db.setCategories(categories))
      );
  }

  create(payload: CategoryPayload) {
    if (this.shouldUseMock()) {
      const category: Category = {
        id: crypto.randomUUID(),
        ...payload
      };
      this.db.upsertCategory(category);
      return of(category).pipe(delay(100));
    }

    return this.http.post<Category>(this.baseUrl, payload).pipe(
      tap((category) => this.db.upsertCategory(category))
    );
  }

  update(categoryId: string, payload: CategoryPayload) {
    if (this.shouldUseMock()) {
      const category: Category = { id: categoryId, ...payload };
      this.db.upsertCategory(category);
      return of(category).pipe(delay(100));
    }

    return this.http.put<Category>(`${this.baseUrl}/${categoryId}`, payload).pipe(
      tap((category) => this.db.upsertCategory(category))
    );
  }

  delete(categoryId: string) {
    if (this.shouldUseMock()) {
      this.db.removeCategory(categoryId);
      return of(void 0).pipe(delay(100));
    }

    return this.http.delete<void>(`${this.baseUrl}/${categoryId}`).pipe(
      tap(() => this.db.removeCategory(categoryId))
    );
  }

  private filterByCompany(list: Category[], companyId?: string) {
    if (!companyId) {
      return list;
    }

    return list.filter((category) => category.companyId === companyId);
  }

  private shouldUseMock() {
    return this.useMockData || typeof window === 'undefined';
  }
}
