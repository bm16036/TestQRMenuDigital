import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Company, CompanyPayload } from '../models/company.model';
import { InMemoryDatabaseService } from './in-memory-database.service';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly db = inject(InMemoryDatabaseService);
  private readonly baseUrl = `${environment.apiBaseUrl}/companies`;
  private readonly useMockData = environment.useMockData;

  readonly companies = this.db.companies;

  load() {
    if (this.shouldUseMock()) {
      return of(this.db.companies()).pipe(delay(100));
    }

    return this.http.get<Company[]>(this.baseUrl).pipe(tap((companies) => this.db.setCompanies(companies)));
  }

  create(payload: CompanyPayload) {
    if (this.shouldUseMock()) {
      const company: Company = { id: crypto.randomUUID(), ...payload };
      this.db.upsertCompany(company);
      return of(company).pipe(delay(100));
    }

    return this.http.post<Company>(this.baseUrl, payload).pipe(
      tap((company) => this.db.upsertCompany(company))
    );
  }

  update(companyId: string, payload: CompanyPayload) {
    if (this.shouldUseMock()) {
      const company: Company = { id: companyId, ...payload };
      this.db.upsertCompany(company);
      return of(company).pipe(delay(100));
    }

    return this.http.put<Company>(`${this.baseUrl}/${companyId}`, payload).pipe(
      tap((company) => this.db.upsertCompany(company))
    );
  }

  delete(companyId: string) {
    if (this.shouldUseMock()) {
      this.db.removeCompany(companyId);
      return of(void 0).pipe(delay(100));
    }

    return this.http.delete<void>(`${this.baseUrl}/${companyId}`).pipe(
      tap(() => this.db.removeCompany(companyId))
    );
  }

  private shouldUseMock() {
    return this.useMockData || typeof window === 'undefined';
  }
}
