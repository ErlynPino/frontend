import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { UserService } from '../../../../core/services/user.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { noWhitespaceValidator, corporateEmailValidator } from '../../../../shared/validators/user.validators';
import { UserRole } from '../../../../core/models/user.model';

const ROLES: { label: string; value: UserRole }[] = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Invitado', value: 'guest' },
  { label: 'Usuario', value: 'user' },
];

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Acceso total al sistema. Puede gestionar usuarios y configuración.',
  guest: 'Acceso de solo lectura como invitado. Sin permisos de escritura.',
  user: 'Acceso estándar de solo lectura al portal.',
};

@Component({
  selector: 'app-user-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToggleSwitchModule,
    PageHeaderComponent,
    ConfirmDialogComponent,
  ],
})
export class UserFormComponent implements OnInit {
  readonly id = input<string>();

  protected readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly roles = ROLES;
  readonly roleDescriptions = ROLE_DESCRIPTIONS;

  readonly dialogVisible = signal(false);

  readonly form = this.fb.nonNullable.group({
    username:   ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_-]+$/)]], 
    email:      ['', [Validators.required, Validators.email, corporateEmailValidator]],
    first_name: ['', [Validators.required, noWhitespaceValidator]],
    last_name:  ['', [Validators.required, noWhitespaceValidator]],
    role:       ['user' as UserRole, Validators.required],
    active:     [true],
  });

  get isEdit(): boolean {
    return !!this.id();
  }

  ngOnInit(): void {
    if (this.isEdit) {
        this.form.get('first_name')?.clearValidators();
      this.form.get('first_name')?.updateValueAndValidity();
      this.form.get('last_name')?.clearValidators();
      this.form.get('last_name')?.updateValueAndValidity();

      this.userService.getById(this.id()!).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe((user) => {
        if (user) {
          this.form.patchValue({
            username:   user.username,
            email:      user.email,
            first_name: user.first_name ?? '',
            last_name:  user.last_name ?? '',
            role:       user.role,
            active:     user.active,
          });
        }
      });
    }
  }

  fieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogVisible.set(true);
  }

  onConfirmed(): void {
    const value = this.form.getRawValue();

    if (this.isEdit) {
      const updatePayload = {
        ...value,
        first_name: value.first_name.trim(),
        last_name:  value.last_name.trim(),
      };
      this.userService.fullUpdate(this.id()!, updatePayload).subscribe(() => {
        this.router.navigate(['/users']);
      });
    } else {
      const createPayload = {
        ...value,
        first_name: value.first_name.trim(),
        last_name:  value.last_name.trim(),
      };
      this.userService.create(createPayload).subscribe(() => {
        this.router.navigate(['/users']);
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}

