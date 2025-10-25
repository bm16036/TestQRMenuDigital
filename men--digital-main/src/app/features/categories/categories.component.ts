import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Category, CategoryPayload } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly editingCategory = signal<Category | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: [''],
  });

  readonly isEditing = computed(() => this.editingCategory() !== null);
  readonly formTitle = computed(() => (this.isEditing() ? 'Editar categoría' : 'Nueva categoría'));
  readonly submitLabel = computed(() =>
    this.isEditing() ? 'Actualizar categoría' : 'Crear categoría',
  );
  readonly hasCategories = computed(() => this.categories().length > 0);

  private successTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      if (this.successMessage()) {
        this.startSuccessCountdown();
      }
    });

    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoryService
      .getCategories()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las categorías. Intenta nuevamente.');
          this.loading.set(false);
        },
      });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();

    if (!payload.nombre) {
      this.form.controls.nombre.setErrors({ required: true });
      this.form.markAllAsTouched();
      return;
    }

    const editing = this.editingCategory();

    this.saving.set(true);
    this.error.set(null);

    const request$ = editing
      ? this.categoryService.updateCategory(editing.id, payload)
      : this.categoryService.createCategory(payload);

    request$
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (category) => {
          if (editing) {
            this.categories.update((items) =>
              items.map((item) => (item.id === category.id ? category : item)),
            );
            this.showSuccess('Categoría actualizada correctamente.');
          } else {
            this.categories.update((items) => [...items, category]);
            this.showSuccess('Categoría creada correctamente.');
          }

          this.resetForm();
          this.saving.set(false);
        },
        error: () => {
          this.error.set('No se pudo guardar la categoría. Intenta nuevamente.');
          this.saving.set(false);
        },
      });
  }

  startEdit(category: Category): void {
    this.editingCategory.set(category);
    this.form.setValue({
      nombre: category.nombre,
      descripcion: category.descripcion ?? '',
    });
    this.successMessage.set(null);
    this.error.set(null);
  }

  cancelEdit(): void {
    if (!this.isEditing()) {
      return;
    }
    this.resetForm();
  }

  deleteCategory(category: Category): void {
    if (this.deletingId() !== null) {
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la categoría "${category.nombre}"?`,
    );

    if (!confirmed) {
      return;
    }

    this.deletingId.set(category.id);
    this.error.set(null);

    this.categoryService
      .deleteCategory(category.id)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.categories.update((items) => items.filter((item) => item.id !== category.id));
          this.showSuccess('Categoría eliminada correctamente.');
          this.deletingId.set(null);
        },
        error: () => {
          this.error.set('No se pudo eliminar la categoría. Intenta nuevamente.');
          this.deletingId.set(null);
        },
      });
  }

  trackById(_: number, category: Category): number {
    return category.id;
  }

  get nombreControl() {
    return this.form.controls.nombre;
  }

  private buildPayload(): CategoryPayload {
    const nombre = this.form.controls.nombre.value.trim();
    const descripcionValue = this.form.controls.descripcion.value?.trim() ?? '';

    return {
      nombre,
      descripcion: descripcionValue.length > 0 ? descripcionValue : null,
    };
  }

  private resetForm(): void {
    this.form.reset({ nombre: '', descripcion: '' });
    this.editingCategory.set(null);
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
  }

  private startSuccessCountdown(): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }

    this.successTimer = setTimeout(() => {
      this.successMessage.set(null);
      this.successTimer = null;
    }, 3500);
  }
}
