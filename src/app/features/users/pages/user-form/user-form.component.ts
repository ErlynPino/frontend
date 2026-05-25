import { Component, inject, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { UserService } from '../../../../core/services/user.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UserRole } from '../../../../core/models/user.model';

const ROLES: { label: string; value: UserRole }[] = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Moderador', value: 'moderator' },
  { label: 'Usuario', value: 'user' },
];

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Acceso total al sistema. Puede gestionar usuarios y configuración.',
  moderator: 'Puede revisar y moderar contenido, sin acceso a configuración.',
  user: 'Acceso estándar de solo lectura al portal.',
};

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    ToggleSwitchModule,
    PageHeaderComponent,
  ],
})
export class UserFormComponent implements OnInit {
  readonly id = input<string>();

  protected readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly roles = ROLES;
  readonly roleDescriptions = ROLE_DESCRIPTIONS;

  readonly form = this.fb.nonNullable.group({
    username:  ['', [Validators.required, Validators.minLength(3)]],
    email:     ['', [Validators.required, Validators.email]],
    full_name: [''],
    password:  ['', [Validators.minLength(8)]],
    role:      ['user' as UserRole, Validators.required],
    is_active: [true],
  });

  get isEdit(): boolean {
    return !!this.id();
  }

  ngOnInit(): void {
    if (this.isEdit) {
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();

      this.userService.getById(+this.id()!).subscribe((user) => {
        if (user) {
          this.form.patchValue({
            username:  user.username,
            email:     user.email,
            full_name: user.full_name ?? '',
            role:      user.role,
            is_active: user.is_active,
          });
        }
      });
    } else {
      this.form.get('password')?.addValidators(Validators.required);
      this.form.get('password')?.updateValueAndValidity();
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

    const value = this.form.getRawValue();

    if (this.isEdit) {
      const { password, ...rest } = value;
      this.userService.update(+this.id()!, rest).subscribe(() => {
        this.router.navigate(['/users']);
      });
    } else {
      this.userService.create(value).subscribe(() => {
        this.router.navigate(['/users']);
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}

