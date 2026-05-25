import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import {
  PaginatedResponse,
  RemoteData,
  User,
  UserCreate,
  UserListParams,
  UserPatch,
  UserUpdate,
} from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  private readonly _usersState = signal<RemoteData<User[]>>({ status: 'idle' });
  private readonly _selectedUserState = signal<RemoteData<User>>({ status: 'idle' });
  private readonly _total = signal<number>(0);
  private readonly _mutating = signal<boolean>(false);
  private _cacheStale = false;
  private _lastParamsKey = '';

  readonly usersState = this._usersState.asReadonly();
  readonly selectedUserState = this._selectedUserState.asReadonly();

  readonly users = computed(() => {
    const s = this._usersState();
    return s.status === 'success' ? s.data : [];
  });

  readonly loading = computed(
    () =>
      this._usersState().status === 'loading' ||
      this._selectedUserState().status === 'loading' ||
      this._mutating(),
  );

  readonly total = this._total.asReadonly();

  readonly error = computed<string | null>(() => {
    const u = this._usersState();
    const s = this._selectedUserState();
    if (u.status === 'error') return u.error;
    if (s.status === 'error') return s.error;
    return null;
  });

  readonly selectedUser = computed(() => {
    const s = this._selectedUserState();
    return s.status === 'success' ? s.data : null;
  });

  readonly activeUsers = computed(() => this.users().filter((u) => u.active));
  readonly inactiveUsers = computed(() => this.users().filter((u) => !u.active));

  loadUsers(params: UserListParams = {}): void {
    const paramsKey = `${params.skip ?? 0}:${params.limit ?? 50}`;
    const alreadyLoading = this._usersState().status === 'loading' && this._lastParamsKey === paramsKey;
    const cacheHit = this.users().length > 0 && !this._cacheStale && this._lastParamsKey === paramsKey;
    if (alreadyLoading || cacheHit) return;
    this._cacheStale = false;
    this._lastParamsKey = paramsKey;
    this._usersState.set({ status: 'loading' });

    const queryParams: Record<string, number> = {
      skip: params.skip ?? 0,
      limit: params.limit ?? 50,
    };

    this.api
      .get<PaginatedResponse<User>>('/users', queryParams)
      .subscribe({
        next: (res) => {
          this._usersState.set({ status: 'success', data: res.data });
          this._total.set(res.total);
        },
        error: (err) => this._usersState.set({ status: 'error', error: err.message }),
      });
  }

  getById(id: string): Observable<User> {
    this._selectedUserState.set({ status: 'loading' });
    return this.api.get<User>(`/users/${id}`).pipe(
      tap({
        next: (user) => this._selectedUserState.set({ status: 'success', data: user }),
        error: (err) => this._selectedUserState.set({ status: 'error', error: err.message }),
      }),
    );
  }

  create(payload: UserCreate): Observable<User> {
    this._mutating.set(true);
    return this.api.post<User>('/users', payload).pipe(
      tap({
        next: (user) => {
          this._usersState.update((s) =>
            s.status === 'success' ? { ...s, data: [...s.data, user] } : s,
          );
          this._cacheStale = true;
        },
        error: (err) => this._usersState.set({ status: 'error', error: err.message }),
      }),
      finalize(() => this._mutating.set(false)),
    );
  }

  fullUpdate(id: string, payload: UserUpdate): Observable<User> {
    this._mutating.set(true);
    return this.api.put<User>(`/users/${id}`, payload).pipe(
      tap({
        next: (updated) => {
          this._usersState.update((s) =>
            s.status === 'success'
              ? { ...s, data: s.data.map((u) => (u.id === id ? updated : u)) }
              : s,
          );
          this._selectedUserState.set({ status: 'success', data: updated });
          this._cacheStale = true;
        },
        error: (err) => this._usersState.set({ status: 'error', error: err.message }),
      }),
      finalize(() => this._mutating.set(false)),
    );
  }

  update(id: string, payload: UserPatch): Observable<User> {
    this._mutating.set(true);
    return this.api.patch<User>(`/users/${id}`, payload).pipe(
      tap({
        next: (updated) => {
          this._usersState.update((s) =>
            s.status === 'success'
              ? { ...s, data: s.data.map((u) => (u.id === id ? updated : u)) }
              : s,
          );
          this._selectedUserState.set({ status: 'success', data: updated });
          this._cacheStale = true;
        },
        error: (err) => this._usersState.set({ status: 'error', error: err.message }),
      }),
      finalize(() => this._mutating.set(false)),
    );
  }

  delete(id: string): Observable<void> {
    this._mutating.set(true);
    return this.api.delete<void>(`/users/${id}`).pipe(
      tap({
        next: () => {
          this._usersState.update((s) =>
            s.status === 'success'
              ? { ...s, data: s.data.filter((u) => u.id !== id) }
              : s,
          );
          this._cacheStale = true;
        },
        error: (err) => this._usersState.set({ status: 'error', error: err.message }),
      }),
      finalize(() => this._mutating.set(false)),
    );
  }

  clearSelectedUser(): void {
    this._selectedUserState.set({ status: 'idle' });
  }

  clearError(): void {
    this._usersState.update((s) => (s.status === 'error' ? { status: 'idle' } : s));
    this._selectedUserState.update((s) => (s.status === 'error' ? { status: 'idle' } : s));
  }
}
