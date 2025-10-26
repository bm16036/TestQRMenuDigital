import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CompanyService } from '../../core/services/company.service';
import { Company } from '../../core/models/company.model';

@Component({
  selector: 'app-company-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-management.component.html',
  styleUrl: './company-management.component.scss'
})
export class CompanyManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);

  readonly companies = this.companyService.companies;
  readonly selectedCompanyId = signal<string | null>(null);
  readonly feedbackMessage = signal<string | null>(null);
  readonly isSaving = signal(false);

  readonly companyForm = this.fb.nonNullable.group({
    taxId: ['', [Validators.required, Validators.maxLength(20)]],
    businessName: ['', [Validators.required, Validators.maxLength(120)]],
    commercialName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    logoUrl: ['', Validators.required]
  });

  constructor() {
    this.companyService.load().subscribe();
  }

  edit(company: Company) {
    this.selectedCompanyId.set(company.id);
    this.companyForm.patchValue(company);
  }

  cancelEdit() {
    this.selectedCompanyId.set(null);
    this.companyForm.reset({
      taxId: '',
      businessName: '',
      commercialName: '',
      email: '',
      phone: '',
      logoUrl: ''
    });
  }

  save() {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.companyForm.getRawValue();

    const request$ = this.selectedCompanyId()
      ? this.companyService.update(this.selectedCompanyId()!, payload)
      : this.companyService.create(payload);

    request$.subscribe({
      next: () => {
        this.feedbackMessage.set('Empresa guardada correctamente.');
        this.isSaving.set(false);
        this.cancelEdit();
      },
      error: () => {
        this.feedbackMessage.set('No se pudo guardar la empresa.');
        this.isSaving.set(false);
      }
    });
  }

  delete(companyId: string) {
    if (!confirm('¿Eliminar esta empresa? Los usuarios asociados perderán acceso.')) {
      return;
    }

    this.companyService.delete(companyId).subscribe();
  }
}
