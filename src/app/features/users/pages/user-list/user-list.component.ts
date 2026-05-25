import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UserService } from '../../../../core/services/user.service';
import { User, UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  imports: [
    DatePipe,
    ButtonModule,
    TableModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    PageHeaderComponent,
  ],
})
export class UserListComponent implements OnInit {
  protected readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);

  readonly skeletonRows = Array(5).fill({});

  private static readonly AVATAR_COLORS = [
    '#E40613', '#002B5C', '#00A3E0', '#10B981',
    '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4',
  ];

  private static readonly ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador',
    moderator: 'Moderador',
    user: 'Usuario',
  };

  private static readonly ROLE_SEVERITY: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
    admin: 'danger',
    moderator: 'warn',
    user: 'info',
  };

  ngOnInit(): void {
    this.userService.loadUsers();
  }

  avatarColor(username: string): string {
    const colors = UserListComponent.AVATAR_COLORS;
    return colors[username.charCodeAt(0) % colors.length];
  }

  roleLabel(role: UserRole): string {
    return UserListComponent.ROLE_LABELS[role] ?? role;
  }

  roleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return UserListComponent.ROLE_SEVERITY[role] ?? 'secondary';
  }

  navigateToCreate(): void {
    this.router.navigate(['/users/new']);
  }

  viewUser(user: User): void {
    this.router.navigate(['/users', user.id]);
  }

  editUser(user: User): void {
    this.router.navigate(['/users', user.id, 'edit']);
  }

  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar al usuario <strong>${user.username}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.delete(user.id).subscribe();
      },
    });
  }
}

