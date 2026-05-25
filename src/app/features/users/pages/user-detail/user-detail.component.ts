import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { UserService } from '../../../../core/services/user.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  imports: [
    DatePipe,
    ButtonModule,
    TagModule,
    SkeletonModule,
    PageHeaderComponent,
    ConfirmDialogComponent,
  ],
})
export class UserDetailComponent implements OnInit {
  readonly id = input.required<string>();

  protected readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected readonly user = this.userService.selectedUser;
  readonly dialogVisible = signal(false);

  private static readonly AVATAR_COLORS = [
    '#E40613', '#002B5C', '#00A3E0', '#10B981',
    '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4',
  ];

  private static readonly ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador',
    guest: 'Invitado',
    user: 'Usuario',
  };

  ngOnInit(): void {
    this.userService.getById(this.id()).subscribe();
  }

  avatarColor(username: string): string {
    const colors = UserDetailComponent.AVATAR_COLORS;
    return colors[username.charCodeAt(0) % colors.length];
  }

  roleLabel(role: UserRole): string {
    return UserDetailComponent.ROLE_LABELS[role] ?? role;
  }

  roleSeverity(role: UserRole): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      admin: 'danger',
      guest: 'secondary',
      user: 'info',
    };
    return map[role] ?? 'secondary';
  }

  edit(): void {
    this.dialogVisible.set(true);
  }

  onConfirmEdit(): void {
    this.router.navigate(['/users', this.id(), 'edit']);
  }

  back(): void {
    this.router.navigate(['/users']);
  }
}

