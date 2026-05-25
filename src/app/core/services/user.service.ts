import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  PaginatedResponse,
  User,
  UserCreate,
  UserListParams,
  UserUpdate,
} from '../models/user.model';
import { ApiService } from './api.service';

/**
 * UserService — gestión de estado reactivo con Angular Signals (SRP).
 * Expone señales de solo lectura y métodos que orquestan llamadas HTTP.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  // ── Estado privado ──────────────────────────────────────────────────
  private readonly _users = signal<User[]>([]);
  private readonly _selectedUser = signal<User | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _total = signal<number>(0);
  private readonly _error = signal<string | null>(null);

  // ── Señales públicas (readonly) ────────────────────────────────────
  readonly users = this._users.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();
  readonly error = this._error.asReadonly();

  readonly activeUsers = computed(() => this._users().filter((u) => u.is_active));
  readonly inactiveUsers = computed(() => this._users().filter((u) => !u.is_active));

  // ── Métodos públicos ───────────────────────────────────────────────

  loadUsers(params: UserListParams = {}): void {
    this._loading.set(true);
    this._error.set(null);

    const queryParams: Record<string, number> = {
      skip: params.skip ?? 0,
      limit: params.limit ?? 50,
    };

    this.api
      .get<PaginatedResponse<User>>('/users', queryParams)
      .subscribe({
        next: (res) => {
          this._users.set(res.data);
          this._total.set(res.total);
        },
        error: (err) => this._error.set(err.message),
        complete: () => this._loading.set(false),
      });
  }

  getById(id: number): Observable<User> {
    this._loading.set(true);
    this._error.set(null);
    return this.api.get<User>(`/users/${id}`).pipe(
      tap({
        next: (user) => this._selectedUser.set(user),
        error: (err) => this._error.set(err.message),
        complete: () => this._loading.set(false),
      }),
    );
  }

  create(payload: UserCreate): Observable<User> {
    this._loading.set(true);
    this._error.set(null);
    return this.api.post<User>('/users', payload).pipe(
      tap({
        next: (user) => this._users.update((list) => [...list, user]),
        error: (err) => this._error.set(err.message),
        complete: () => this._loading.set(false),
      }),
    );
  }

  update(id: number, payload: UserUpdate): Observable<User> {
    this._loading.set(true);
    this._error.set(null);
    return this.api.patch<User>(`/users/${id}`, payload).pipe(
      tap({
        next: (updated) => {
          this._users.update((list) =>
            list.map((u) => (u.id === id ? updated : u)),
          );
          this._selectedUser.set(updated);
        },
        error: (err) => this._error.set(err.message),
        complete: () => this._loading.set(false),
      }),
    );
  }

  delete(id: number): Observable<void> {
    this._loading.set(true);
    this._error.set(null);
    return this.api.delete<void>(`/users/${id}`).pipe(
      tap({
        next: () => this._users.update((list) => list.filter((u) => u.id !== id)),
        error: (err) => this._error.set(err.message),
        complete: () => this._loading.set(false),
      }),
    );
  }

  clearSelectedUser(): void {
    this._selectedUser.set(null);
  }

  clearError(): void {
    this._error.set(null);
  }
}
