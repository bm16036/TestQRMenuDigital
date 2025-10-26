import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { CompanyService } from '../../core/services/company.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly companyService = inject(CompanyService);

  readonly user = this.authService.currentUser;
  readonly companies = this.companyService.companies;

  readonly currentCompany = computed(() => {
    const companyId = this.user()?.companyId;
    return this.companies().find((company) => company.id === companyId) ?? null;
  });

  constructor() {
    // Cargamos las empresas en memoria para poder mostrar los datos básicos del encabezado.
    // Cuando el backend esté disponible este método realizará la petición HTTP correspondiente.
    this.companyService.load().subscribe();
  }

  logout() {
    this.authService.logout();
  }
}
