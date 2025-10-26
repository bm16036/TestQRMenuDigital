import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { CompanyService } from '../../core/services/company.service';
import { UserService } from '../../core/services/user.service';
import { User, UserRole } from '../../core/models/user.model';
import { EMAIL_REGEX } from '../../core/constants/validation.constants';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly companyService = inject(CompanyService);
  private readonly authService = inject(AuthService);

  readonly users = this.userService.users;
  readonly companies = this.companyService.companies;

  readonly selectedUserId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly feedbackMessage = signal<string | null>(null);

  readonly userForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(80)]],
    username: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
    role: this.fb.nonNullable.control<UserRole>('USER', Validators.required),
    companyId: ['', Validators.required],
    active: [true],
    password: this.fb.nonNullable.control('', [])
  });

  constructor() {
    const companyId = this.authService.currentUser()?.companyId;
    this.companyService.load().subscribe();
    this.userService.load(companyId).subscribe();

    if (companyId) {
      this.userForm.get('companyId')?.setValue(companyId);
      this.userForm.get('companyId')?.disable();
    }

    this.updatePasswordValidators(false);
  }

  edit(user: User) {
    this.selectedUserId.set(user.id);
    this.userForm.patchValue({
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      companyId: user.companyId,
      active: user.active,
      password: ''
    });

    this.updatePasswordValidators(true);

    if (this.authService.currentUser()?.companyId) {
      this.userForm.get('companyId')?.disable();
    } else {
      this.userForm.get('companyId')?.enable();
    }
  }

  cancelEdit() {
    this.selectedUserId.set(null);
    this.userForm.reset({
      fullName: '',
      username: '',
      role: 'USER',
      companyId: this.authService.currentUser()?.companyId ?? '',
      active: true,
      password: ''
    });
    if (this.authService.currentUser()?.companyId) {
      this.userForm.get('companyId')?.disable();
    } else {
      this.userForm.get('companyId')?.enable();
    }

    this.updatePasswordValidators(false);
  }

  private updatePasswordValidators(isEditing: boolean) {
    const passwordControl = this.userForm.controls.password;
    const optionalPasswordValidator: ValidatorFn = (control) => {
      const value = (control.value as string).trim();
      if (!value) {
        return null;
      }
      return value.length >= 8
        ? null
        : { minlength: { requiredLength: 8, actualLength: value.length } };
    };
    if (isEditing) {
      passwordControl.setValidators([optionalPasswordValidator]);
    } else {
      passwordControl.setValidators([Validators.required, Validators.minLength(8)]);
    }
    passwordControl.updateValueAndValidity();
  }

  save() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.userForm.getRawValue();
    const request$ = this.selectedUserId()
      ? this.userService.update(this.selectedUserId()!, {
          ...payload,
          password: payload.password || undefined
        })
      : this.userService.create(payload);

    request$.subscribe({
      next: () => {
        this.feedbackMessage.set('Usuario guardado correctamente.');
        this.isSaving.set(false);
        this.cancelEdit();
      },
      error: () => {
        this.feedbackMessage.set('No se pudo guardar el usuario. Intenta nuevamente.');
        this.isSaving.set(false);
      }
    });
  }

  delete(userId: string) {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    this.userService.delete(userId).subscribe();
  }
}
