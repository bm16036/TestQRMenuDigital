import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Menu, MenuPayload } from '../models/menu.model';
import { InMemoryDatabaseService } from './in-memory-database.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly db = inject(InMemoryDatabaseService);
  private readonly baseUrl = `${environment.apiBaseUrl}/menus`;
  private readonly useMockData = environment.useMockData;

  readonly menus = this.db.menus;

  load(companyId?: string) {
    if (this.shouldUseMock()) {
      return of(this.filterByCompany(this.db.menus(), companyId)).pipe(delay(100));
    }

    return this.http
      .get<Menu[]>(this.baseUrl, {
        params: companyId ? { companyId } : undefined
      })
      .pipe(tap((menus) => this.db.setMenus(menus)));
  }

  create(payload: MenuPayload) {
    if (this.shouldUseMock()) {
      const menu: Menu = {
        id: crypto.randomUUID(),
        ...payload
      };
      this.db.upsertMenu(menu);
      return of(menu).pipe(delay(100));
    }

    return this.http.post<Menu>(this.baseUrl, payload).pipe(tap((menu) => this.db.upsertMenu(menu)));
  }

  update(menuId: string, payload: MenuPayload) {
    if (this.shouldUseMock()) {
      const menu: Menu = { id: menuId, ...payload };
      this.db.upsertMenu(menu);
      return of(menu).pipe(delay(100));
    }

    return this.http
      .put<Menu>(`${this.baseUrl}/${menuId}`, payload)
      .pipe(tap((menu) => this.db.upsertMenu(menu)));
  }

  delete(menuId: string) {
    if (this.shouldUseMock()) {
      this.db.removeMenu(menuId);
      return of(void 0).pipe(delay(100));
    }

    return this.http.delete<void>(`${this.baseUrl}/${menuId}`).pipe(tap(() => this.db.removeMenu(menuId)));
  }

  private filterByCompany(list: Menu[], companyId?: string) {
    if (!companyId) {
      return list;
    }

    return list.filter((menu) => menu.companyId === companyId);
  }

  private shouldUseMock() {
    return this.useMockData || typeof window === 'undefined';
  }
}
