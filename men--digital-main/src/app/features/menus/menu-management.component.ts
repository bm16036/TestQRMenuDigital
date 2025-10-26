import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { MenuService } from '../../core/services/menu.service';
import { Menu } from '../../core/models/menu.model';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.scss'
})
export class MenuManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly menuService = inject(MenuService);
  private readonly authService = inject(AuthService);

  readonly menus = this.menuService.menus;
  readonly selectedMenuId = signal<string | null>(null);
  readonly feedbackMessage = signal<string | null>(null);
  readonly isSaving = signal(false);

  readonly menuForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    active: [true]
  });

  constructor() {
    const companyId = this.authService.currentUser()?.companyId;
    this.menuService.load(companyId).subscribe();
  }

  get nameControl() {
    return this.menuForm.get('name');
  }

  edit(menu: Menu) {
    this.selectedMenuId.set(menu.id);
    this.menuForm.setValue({
      name: menu.name,
      active: menu.active
    });
  }

  cancelEdit() {
    this.selectedMenuId.set(null);
    this.menuForm.reset({ name: '', active: true });
  }

  save() {
    if (this.menuForm.invalid) {
      this.menuForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const companyId = this.authService.currentUser()?.companyId ?? '';
    const payload = {
      ...this.menuForm.getRawValue(),
      companyId
    };

    const request$ = this.selectedMenuId()
      ? this.menuService.update(this.selectedMenuId()!, payload)
      : this.menuService.create(payload);

    request$.subscribe({
      next: () => {
        this.feedbackMessage.set('Menú guardado correctamente.');
        this.isSaving.set(false);
        this.cancelEdit();
      },
      error: () => {
        this.feedbackMessage.set('No se pudo guardar el menú.');
        this.isSaving.set(false);
      }
    });
  }

  delete(menuId: string) {
    const confirmed = confirm('¿Deseas eliminar este menú?');
    if (!confirmed) {
      return;
    }

    this.menuService.delete(menuId).subscribe();
  }
}
