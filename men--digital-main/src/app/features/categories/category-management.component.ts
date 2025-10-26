import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.scss'
})
export class CategoryManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);

  readonly categories = this.categoryService.categories;
  readonly selectedCategoryId = signal<string | null>(null);
  readonly feedbackMessage = signal<string | null>(null);
  readonly isSaving = signal(false);

  readonly categoryForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    active: [true]
  });

  constructor() {
    const companyId = this.authService.currentUser()?.companyId;
    this.categoryService.load(companyId).subscribe();
  }

  get nameControl() {
    return this.categoryForm.get('name');
  }

  edit(category: Category) {
    this.selectedCategoryId.set(category.id);
    this.categoryForm.setValue({
      name: category.name,
      active: category.active
    });
  }

  cancelEdit() {
    this.selectedCategoryId.set(null);
    this.categoryForm.reset({ name: '', active: true });
  }

  save() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const companyId = this.authService.currentUser()?.companyId ?? '';
    const payload = {
      ...this.categoryForm.getRawValue(),
      companyId
    };

    const request$ = this.selectedCategoryId()
      ? this.categoryService.update(this.selectedCategoryId()!, payload)
      : this.categoryService.create(payload);

    request$.subscribe({
      next: () => {
        this.feedbackMessage.set('Cambios guardados correctamente.');
        this.isSaving.set(false);
        this.cancelEdit();
      },
      error: () => {
        this.feedbackMessage.set('Ocurrió un error al guardar. Intenta nuevamente.');
        this.isSaving.set(false);
      }
    });
  }

  delete(categoryId: string) {
    const confirmed = confirm('¿Deseas eliminar esta categoría?');
    if (!confirmed) {
      return;
    }

    this.categoryService.delete(categoryId).subscribe();
  }
}
