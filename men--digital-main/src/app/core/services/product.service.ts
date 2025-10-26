import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Product, ProductPayload } from '../models/product.model';
import { InMemoryDatabaseService } from './in-memory-database.service';

export interface ProductFilters {
  companyId?: string;
  categoryId?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly db = inject(InMemoryDatabaseService);
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;
  private readonly useMockData = environment.useMockData;

  readonly products = this.db.products;

  load(filters?: ProductFilters) {
    if (this.shouldUseMock()) {
      const filtered = this.db
        .products()
        .filter((product) =>
          (!filters?.companyId || product.companyId === filters.companyId) &&
          (!filters?.categoryId || product.categoryId === filters.categoryId)
        );
      return of(filtered).pipe(delay(100));
    }

    const params = this.buildQueryParams(filters);
    return this.http.get<Product[]>(this.baseUrl, { params }).pipe(
      tap((products) => this.db.setProducts(products))
    );
  }

  create(payload: ProductPayload) {
    if (this.shouldUseMock()) {
      const product: Product = { id: crypto.randomUUID(), ...payload };
      this.db.upsertProduct(product);
      return of(product).pipe(delay(100));
    }

    return this.http.post<Product>(this.baseUrl, payload).pipe(
      tap((product) => this.db.upsertProduct(product))
    );
  }

  update(productId: string, payload: ProductPayload) {
    if (this.shouldUseMock()) {
      const product: Product = { id: productId, ...payload };
      this.db.upsertProduct(product);
      return of(product).pipe(delay(100));
    }

    return this.http.put<Product>(`${this.baseUrl}/${productId}`, payload).pipe(
      tap((product) => this.db.upsertProduct(product))
    );
  }

  delete(productId: string) {
    if (this.shouldUseMock()) {
      this.db.removeProduct(productId);
      return of(void 0).pipe(delay(100));
    }

    return this.http.delete<void>(`${this.baseUrl}/${productId}`).pipe(
      tap(() => this.db.removeProduct(productId))
    );
  }

  private buildQueryParams(filters?: ProductFilters) {
    if (!filters) {
      return undefined;
    }

    const params: Record<string, string> = {};

    if (filters.companyId) {
      params['companyId'] = filters.companyId;
    }

    if (filters.categoryId) {
      params['categoryId'] = filters.categoryId;
    }

    return Object.keys(params).length ? params : undefined;
  }

  private shouldUseMock() {
    return this.useMockData || typeof window === 'undefined';
  }
}
