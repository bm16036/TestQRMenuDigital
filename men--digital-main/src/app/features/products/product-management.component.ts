import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { MenuService } from '../../core/services/menu.service';
import { ProductService } from '../../core/services/product.service';
import { Product, ProductPayload } from '../../core/models/product.model';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.scss'
})
/**
 * Administra el catálogo de productos desde la vista de backoffice.
 * Separa responsabilidades para que el frontend controle el formulario
 * mientras el backend entiende con claridad qué datos se envían.
 */
export class ProductManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly menuService = inject(MenuService);
  private readonly authService = inject(AuthService);

  /** Identificador de la compañía asociada al usuario autenticado. */
  private readonly currentCompanyId = computed(() => this.authService.currentUser()?.companyId ?? null);

  /** Catálogos leídos desde los servicios para poblar selects y listados. */
  readonly products = this.productService.products;
  readonly categories = this.categoryService.categories;
  readonly menus = this.menuService.menus;

  readonly selectedProductId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly feedbackMessage = signal<string | null>(null);

  /** Formulario principal: valida longitudes y selección de catálogos obligatorios. */
  readonly productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.required, Validators.maxLength(240)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    imageUrl: [
      '',
      [Validators.required, Validators.pattern(/^(https?:\/\/).+/)]
    ],
    categoryId: ['', Validators.required],
    menuIds: this.fb.nonNullable.control<string[]>([], {
      validators: (control) =>
        control.value && control.value.length > 0 ? null : { required: true }
    })
  });

  readonly categoryIdControl = this.productForm.controls.categoryId;

  /**
   * Mantiene la validación sincronizada cuando cambian las categorías disponibles.
   * Si el backend desactiva una categoría, se limpia la marca de error cuando vuelve a estar activa.
   */
  private readonly refreshCategoryValidation = effect(() => {
    this.categories();
    this.ensureCategoryIsStillActive();
  });

  /** Previsualización de precio formateado, útil para frontend. */
  readonly formattedPricePreview = computed(() => {
    const price = this.productForm.get('price')?.value ?? 0;
    return Number(price).toFixed(2);
  });

  /** Diccionario rápido de categorías para mostrar etiquetas desde plantillas. */
  readonly categoryLookup = computed(() => {
    const map = new Map<string, string>();
    for (const category of this.categories()) {
      map.set(category.id, category.name);
    }
    return map;
  });

  /** Diccionario de menús disponibles para transformar los identificadores en nombres. */
  readonly menuLookup = computed(() => {
    const map = new Map<string, string>();
    for (const menu of this.menus()) {
      map.set(menu.id, menu.name);
    }
    return map;
  });

  constructor() {
    this.initializeData();
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
    if (!this.isFormReadyForSubmit()) {
      return;
    }

    this.isSaving.set(true);
    const payload = this.buildPayload();

    this.resolveSaveRequest(payload).subscribe({
      next: () => this.handleSaveSuccess(),
      error: () => this.handleSaveError()
    });
  }

  delete(productId: string) {
    // Confirmación mínima antes de invocar al backend para borrar el registro.
    if (!confirm('¿Eliminar este producto?')) {
      return;
    }

    this.productService.delete(productId).subscribe();
  }

  getMenuNames(menuIds: string[]) {
    // Convierte los IDs almacenados en la base en nombres visibles en la interfaz.
    const lookup = this.menuLookup();
    return menuIds.map((id) => lookup.get(id)).filter((name): name is string => !!name);
  }

  isMenuSelected(menuId: string) {
    return this.productForm.controls.menuIds.value.includes(menuId);
  }

  toggleMenuSelection(menuId: string, checked: boolean) {
    // Garantiza que el control mantenga una lista única de menús seleccionados.
    const control = this.productForm.controls.menuIds;
    const current = control.value;

    let updated = current;

    if (checked && !current.includes(menuId)) {
      updated = [...current, menuId];
    } else if (!checked && current.includes(menuId)) {
      updated = current.filter((id) => id !== menuId);
    }

    if (updated !== current) {
      control.setValue(updated);
    }

    control.markAsTouched();
    control.updateValueAndValidity();
  }

  /** Separa el arranque de datos para mantener el constructor limpio. */
  private initializeData() {
    const companyId = this.currentCompanyId();

    this.categoryService.load(companyId ?? undefined).subscribe();
    this.menuService.load(companyId ?? undefined).subscribe();
    this.productService.load(companyId ? { companyId } : undefined).subscribe();

    this.categoryIdControl.valueChanges.subscribe(() => {
      this.ensureCategoryIsStillActive();
    });
  }

  /** Verifica reglas comunes antes de enviar información al backend. */
  private isFormReadyForSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return false;
    }

    const selectedCategory = this.categories().find(
      (category) => category.id === this.categoryIdControl.value
    );

    if (!selectedCategory?.active) {
      const existingErrors = this.categoryIdControl.errors ?? {};
      this.categoryIdControl.setErrors({
        ...existingErrors,
        inactiveCategory: true
      });
      this.categoryIdControl.markAsTouched();
      return false;
    }

    return true;
  }

  /** Arma el payload esperado por el backend con el ID de compañía incluido. */
  private buildPayload(): ProductPayload {
    const companyId = this.currentCompanyId() ?? '';
    return {
      ...this.productForm.getRawValue(),
      companyId
    };
  }

  /** Decide si corresponde invocar creación o actualización. */
  private resolveSaveRequest(payload: ProductPayload): Observable<Product> {
    return this.selectedProductId()
      ? this.productService.update(this.selectedProductId()!, payload)
      : this.productService.create(payload);
  }

  /** Mensaje y limpieza de estado luego de guardar correctamente. */
  private handleSaveSuccess() {
    this.feedbackMessage.set('Producto guardado correctamente.');
    this.isSaving.set(false);
    this.cancelEdit();
  }

  /** Restablece banderas cuando el backend informa un error. */
  private handleSaveError() {
    this.feedbackMessage.set('No se pudo guardar el producto.');
    this.isSaving.set(false);
  }

  /** Quita la marca de error cuando la categoría vuelve a ser válida. */
  private ensureCategoryIsStillActive() {
    const selectedId = this.categoryIdControl.value;
    const category = selectedId
      ? this.categories().find((item) => item.id === selectedId)
      : undefined;

    if (!selectedId || category?.active) {
      this.removeInactiveCategoryError();
    }
  }

  private removeInactiveCategoryError() {
    const errors = this.categoryIdControl.errors;
    if (!errors?.['inactiveCategory']) {
      return;
    }

    const { inactiveCategory, ...rest } = errors;
    this.categoryIdControl.setErrors(Object.keys(rest).length ? rest : null);
  }
}
