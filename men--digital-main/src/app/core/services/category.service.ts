import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Category, CategoryPayload } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = this.resolveBaseUrl();
  private readonly categoriesUrl = `${this.baseUrl}/api/categorias`;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  createCategory(payload: CategoryPayload): Observable<Category> {
    return this.http.post<Category>(this.categoriesUrl, payload);
  }

  updateCategory(id: number, payload: CategoryPayload): Observable<Category> {
    return this.http.put<Category>(`${this.categoriesUrl}/${id}`, payload);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoriesUrl}/${id}`);
  }

  private resolveBaseUrl(): string {
    const envFromImport = import.meta.env?.['NG_APP_API_URL'];
    const envFromProcess =
      typeof process !== 'undefined' && typeof process.env === 'object'
        ? process.env['NG_APP_API_URL']
        : undefined;
    const envFromGlobal =
      typeof globalThis !== 'undefined'
        ? (globalThis as unknown as { NG_APP_API_URL?: string }).NG_APP_API_URL
        : undefined;

    const resolved = envFromImport ?? envFromProcess ?? envFromGlobal ?? 'http://localhost:3000';

    return resolved.replace(/\/$/, '');
  }
}
