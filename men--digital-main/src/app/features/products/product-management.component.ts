import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { MenuService } from '../../core/services/menu.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.scss'
})
export class ProductManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly menuService = inject(MenuService);
  private readonly authService = inject(AuthService);

  readonly products = this.productService.products;
  readonly categories = this.categoryService.categories;
  readonly menus = this.menuService.menus;

  readonly selectedProductId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly feedbackMessage = signal<string | null>(null);

  readonly productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.required, Validators.maxLength(240)]],
    price: [0, [Validators.required, Validators.min(0)]],
    imageUrl: ['', Validators.required],
    categoryId: ['', Validators.required],
    menuIds: this.fb.nonNullable.control<string[]>([], { validators: Validators.minLength(1) })
  });

  readonly formattedPricePreview = computed(() => {
    const price = this.productForm.get('price')?.value ?? 0;
    return Number(price).toFixed(2);
  });

  readonly categoryLookup = computed(() => {
    const map = new Map<string, string>();
    for (const category of this.categories()) {
      map.set(category.id, category.name);
    }
    return map;
  });

  readonly menuLookup = computed(() => {
    const map = new Map<string, string>();
    for (const menu of this.menus()) {
      map.set(menu.id, menu.name);
    }
    return map;
  });

  constructor() {
    const companyId = this.authService.currentUser()?.companyId;
    this.categoryService.load(companyId).subscribe();
    this.menuService.load(companyId).subscribe();
    this.productService.load({ companyId }).subscribe();
  }

  getCategoryName(categoryId: string) {
    return this.categoryLookup().get(categoryId) ?? 'Sin categoría';
  }

  edit(product: Product) {
    this.selectedProductId.set(product.id);
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      menuIds: [...product.menuIds]
    });
  }

  cancelEdit() {
    this.selectedProductId.set(null);
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      categoryId: '',
      menuIds: []
    });
  }

  save() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const companyId = this.authService.currentUser()?.companyId ?? '';
    const payload = {
      ...this.productForm.getRawValue(),
      companyId
    };

    const request$ = this.selectedProductId()
      ? this.productService.update(this.selectedProductId()!, payload)
      : this.productService.create(payload);

    request$.subscribe({
      next: () => {
        this.feedbackMessage.set('Producto guardado correctamente.');
        this.isSaving.set(false);
        this.cancelEdit();
      },
      error: () => {
        this.feedbackMessage.set('No se pudo guardar el producto.');
        this.isSaving.set(false);
      }
    });
  }

  delete(productId: string) {
    if (!confirm('¿Eliminar este producto?')) {
      return;
    }

    this.productService.delete(productId).subscribe();
  }

  getMenuNames(menuIds: string[]) {
    const lookup = this.menuLookup();
    return menuIds.map((id) => lookup.get(id)).filter((name): name is string => !!name);
  }
}
