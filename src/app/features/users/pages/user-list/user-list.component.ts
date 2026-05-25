import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent, ConfirmSeverity } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserService } from '../../../../core/services/user.service';
import { User, UserRole } from '../../../../core/models/user.model';

interface DialogConfig {
  header: string;
  message: string;
  icon: string;
  confirmLabel: string;
  confirmSeverity: ConfirmSeverity;
  action: () => void;
}

@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    ConfirmDialogComponent,
  ],
})
export class UserListComponent implements OnInit {
  protected readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly skeletonRows = Array(5).fill({});

  readonly dialogVisible = signal(false);
  readonly dialogConfig = signal<DialogConfig>({
    header: '',
    message: '',
    icon: 'pi pi-exclamation-triangle',
    confirmLabel: 'Confirmar',
    confirmSeverity: 'danger',
    action: () => {},
  });

  private static readonly AVATAR_COLORS = [
    '#E40613', '#002B5C', '#00A3E0', '#10B981',
    '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4',
  ];

  private static readonly ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador',
    guest: 'Invitado',
    user: 'Usuario',
  };

  private static readonly ROLE_SEVERITY: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
    admin: 'danger',
    guest: 'secondary',
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
    this.dialogConfig.set({
      header: 'Editar usuario',
      message: `¿Deseas editar la información de <strong>${user.username}</strong>?`,
      icon: 'pi pi-pencil',
      confirmLabel: 'Ir a editar',
      confirmSeverity: 'info',
      action: () => this.router.navigate(['/users', user.id, 'edit']),
    });
    this.dialogVisible.set(true);
  }

  confirmDelete(user: User): void {
    this.dialogConfig.set({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar al usuario <strong>${user.username}</strong>? Esta acción no se puede deshacer.`,
      icon: 'pi pi-trash',
      confirmLabel: 'Eliminar',
      confirmSeverity: 'danger',
      action: () => this.userService.delete(user.id).subscribe(),
    });
    this.dialogVisible.set(true);
  }

  onDialogConfirmed(): void {
    this.dialogConfig().action();
  }

  /** PATCH — toggle rápido de estado activo/inactivo sin abrir el formulario. */
  toggleStatus(user: User): void {
    const newStatus = !user.active;
    this.dialogConfig.set({
      header: newStatus ? 'Activar usuario' : 'Desactivar usuario',
      message: `¿Confirmas ${newStatus ? 'activar' : 'desactivar'} al usuario <strong>${user.username}</strong>?`,
      icon: newStatus ? 'pi pi-check-circle' : 'pi pi-ban',
      confirmLabel: newStatus ? 'Activar' : 'Desactivar',
      confirmSeverity: newStatus ? 'success' : 'warn',
      action: () => this.userService.update(user.id, { active: newStatus }).subscribe(),
    });
    this.dialogVisible.set(true);
  }
}

