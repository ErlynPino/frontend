import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserService } from './user.service';
import { ApiService } from './api.service';
import { User, UserCreate, UserUpdate } from '../models/user.model';

const mockUser: User = {
  id: 'uuid-1',
  username: 'jdoe',
  email: 'jdoe@example.com',
  first_name: 'John',
  last_name: 'Doe',
  role: 'user',
  active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockUser2: User = { ...mockUser, id: 'uuid-2', username: 'jane', active: false };

const paginatedResponse = { total: 2, skip: 0, limit: 10, data: [mockUser, mockUser2] };

describe('UserService', () => {
  let service: UserService;
  let apiSpy: jest.Mocked<Pick<ApiService, 'get' | 'post' | 'put' | 'patch' | 'delete'>>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    apiSpy = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });

    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Estado inicial ─────────────────────────────────────────────────

  it('signals tienen valores por defecto correctos', () => {
    expect(service.users()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.total()).toBe(0);
    expect(service.error()).toBeNull();
    expect(service.selectedUser()).toBeNull();
    expect(service.usersState()).toEqual({ status: 'idle' });
    expect(service.selectedUserState()).toEqual({ status: 'idle' });
  });

  // ── loadUsers ─────────────────────────────────────────────────────

  describe('loadUsers()', () => {
    it('carga usuarios y actualiza signals', () => {
      apiSpy.get.mockReturnValue(of(paginatedResponse));
      service.loadUsers();
      expect(service.users()).toEqual([mockUser, mockUser2]);
      expect(service.total()).toBe(2);
      expect(service.loading()).toBe(false);
    });

    it('pone loading en true durante la petición y false al completar', () => {
      let loadingDuringCall = false;
      apiSpy.get.mockImplementation(() => {
        loadingDuringCall = service.loading();
        return of(paginatedResponse);
      });
      service.loadUsers();
      expect(loadingDuringCall).toBe(true);
      expect(service.loading()).toBe(false);
    });

    it('actualiza error signal si falla', () => {
      apiSpy.get.mockReturnValue(throwError(() => new Error('Network error')));
      service.loadUsers();
      expect(service.error()).toBe('Network error');
    });
  });

  // ── getById ──────────────────────────────────────────────────────

  describe('getById()', () => {
    it('obtiene usuario por id y actualiza selectedUser', () => {
      apiSpy.get.mockReturnValue(of(mockUser));
      service.getById('uuid-1').subscribe((u) => {
        expect(u).toEqual(mockUser);
        expect(service.selectedUser()).toEqual(mockUser);
      });
    });

    it('llama al endpoint correcto', () => {
      apiSpy.get.mockReturnValue(of(mockUser));
      service.getById('uuid-1').subscribe();
      expect(apiSpy.get).toHaveBeenCalledWith('/users/uuid-1');
    });
  });

  // ── create ───────────────────────────────────────────────────────

  describe('create()', () => {
    const payload: UserCreate = {
      username: 'newuser',
      email: 'new@example.com',
      first_name: 'New',
      last_name: 'User',
    };

    it('agrega el nuevo usuario al array de users', () => {
      apiSpy.get.mockReturnValue(of(paginatedResponse));
      service.loadUsers();

      apiSpy.post.mockReturnValue(of({ ...mockUser, id: 'uuid-3', username: 'newuser' }));
      service.create(payload).subscribe();
      expect(service.users()).toHaveLength(3);
    });

    it('llama POST /users con el payload correcto', () => {
      apiSpy.post.mockReturnValue(of(mockUser));
      service.create(payload).subscribe();
      expect(apiSpy.post).toHaveBeenCalledWith('/users', payload);
    });
  });

  // ── fullUpdate (PUT) ────────────────────────────────────────────

  describe('fullUpdate()', () => {
    const updatePayload: UserUpdate = { username: 'jdoe_updated', email: 'updated@ex.com', first_name: 'John', last_name: 'Updated', role: 'admin', active: true };

    it('llama PUT /users/:id con el payload correcto', () => {
      apiSpy.put.mockReturnValue(of({ ...mockUser, ...updatePayload }));
      service.fullUpdate('uuid-1', updatePayload).subscribe();
      expect(apiSpy.put).toHaveBeenCalledWith('/users/uuid-1', updatePayload);
    });

    it('actualiza la lista de usuarios tras PUT', () => {
      apiSpy.get.mockReturnValue(of(paginatedResponse));
      service.loadUsers();

      const updated = { ...mockUser, username: 'jdoe_updated' };
      apiSpy.put.mockReturnValue(of(updated));
      service.fullUpdate('uuid-1', updatePayload).subscribe();
      expect(service.users()[0].username).toBe('jdoe_updated');
    });
  });

  // ── update (PATCH) ──────────────────────────────────────────────

  describe('update() — PATCH', () => {
    it('llama PATCH /users/:id', () => {
      apiSpy.patch.mockReturnValue(of({ ...mockUser, active: false }));
      service.update('uuid-1', { active: false }).subscribe();
      expect(apiSpy.patch).toHaveBeenCalledWith('/users/uuid-1', { active: false });
    });
  });

  // ── delete ──────────────────────────────────────────────────────

  describe('delete()', () => {
    it('elimina el usuario del array de users', () => {
      apiSpy.get.mockReturnValue(of(paginatedResponse));
      service.loadUsers();
      expect(service.users()).toHaveLength(2);

      apiSpy.delete.mockReturnValue(of(undefined));
      service.delete('uuid-1').subscribe();
      expect(service.users()).toHaveLength(1);
      expect(service.users()[0].id).toBe('uuid-2');
    });
  });

  // ── Computed signals ──────────────────────────────────────────────

  describe('computed signals', () => {
    beforeEach(() => {
    TestBed.resetTestingModule();
      apiSpy.get.mockReturnValue(of(paginatedResponse));
      service.loadUsers();
    });

    it('activeUsers filtra solo usuarios activos', () => {
      expect(service.activeUsers()).toHaveLength(1);
      expect(service.activeUsers()[0].username).toBe('jdoe');
    });

    it('inactiveUsers filtra solo usuarios inactivos', () => {
      expect(service.inactiveUsers()).toHaveLength(1);
      expect(service.inactiveUsers()[0].username).toBe('jane');
    });
  });

  // ── clearSelectedUser / clearError ────────────────────────────────

  it('clearSelectedUser limpia la señal selectedUser', () => {
    apiSpy.get.mockReturnValue(of(mockUser));
    service.getById('uuid-1').subscribe();
    expect(service.selectedUser()).toEqual(mockUser);
    service.clearSelectedUser();
    expect(service.selectedUser()).toBeNull();
  });

  it('clearError limpia la señal error', () => {
    apiSpy.get.mockReturnValue(throwError(() => new Error('fail')));
    service.loadUsers();
    expect(service.error()).toBe('fail');
    service.clearError();
    expect(service.error()).toBeNull();
  });
});

