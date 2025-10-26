import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { CompanyService } from '../../core/services/company.service';
import { ProductService } from '../../core/services/product.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly companyService = inject(CompanyService);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly userService = inject(UserService);

  readonly user = this.authService.currentUser;
  readonly categories = this.categoryService.categories;
  readonly products = this.productService.products;
  readonly users = this.userService.users;

  readonly metrics = computed(() => [
    {
      label: 'Categorías registradas',
      value: this.categories().length,
      accent: 'accent-primary'
    },
    {
      label: 'Productos publicados',
      value: this.products().length,
      accent: 'accent-secondary'
    },
    {
      label: 'Usuarios activos',
      value: this.users().filter((user) => user.active).length,
      accent: 'accent-tertiary'
    }
  ]);

  readonly latestProducts = computed(() => this.products().slice(0, 4));

  constructor() {
    const companyId = this.user()?.companyId;
    this.companyService.load().subscribe();
    this.categoryService.load(companyId).subscribe();
    this.productService.load({ companyId }).subscribe();
    this.userService.load(companyId).subscribe();
  }
}
