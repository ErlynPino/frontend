import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../../../core/services/user.service';
import { ConfirmationService } from 'primeng/api';
import { User, UserRole } from '../../../../core/models/user.model';

@Component({ standalone: true, template: '' })
class DummyComponent {}

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'uuid-1',
  username: 'jdoe',
  email: 'jdoe@example.com',
  first_name: 'John',
  last_name: 'Doe',
  role: 'user' as UserRole,
  active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const mockUsers = [
  makeUser({ id: 'uuid-1', username: 'jdoe', active: true }),
  makeUser({ id: 'uuid-2', username: 'jane', active: false }),
];

const userServiceMock = {
  users: signal(mockUsers),
  loading: signal(false),
  total: signal(2),
  activeUsers: signal([mockUsers[0]]),
  inactiveUsers: signal([mockUsers[1]]),
  loadUsers: jest.fn(),
  delete: jest.fn().mockReturnValue(of(undefined)),
  update: jest.fn().mockReturnValue(of(mockUsers[0])),
};

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [UserListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'users', component: DummyComponent },
          { path: 'users/new', component: DummyComponent },
          { path: 'users/:id', component: DummyComponent },
          { path: 'users/:id/edit', component: DummyComponent },
        ]),
        { provide: UserService, useValue: userServiceMock },
        ConfirmationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('llama loadUsers() en ngOnInit', () => {
    expect(userServiceMock.loadUsers).toHaveBeenCalled();
  });

  it('roleSeverity devuelve "danger" para admin', () => {
    expect(component.roleSeverity('admin')).toBe('danger');
  });

  it('roleSeverity devuelve "info" para user', () => {
    expect(component.roleSeverity('user')).toBe('info');
  });

  it('roleSeverity devuelve "secondary" para roles desconocidos', () => {
    expect(component.roleSeverity('unknown')).toBe('secondary');
  });

  it('toggleStatus llama update con active invertido', () => {
    const user = makeUser({ active: true });
    component.toggleStatus(user);
    expect(userServiceMock.update).toHaveBeenCalledWith('uuid-1', { active: false });
  });

  it('confirmDelete llama delete del servicio al confirmar', () => {
    const confirmSpy = jest.spyOn(
      TestBed.inject(ConfirmationService),
      'confirm',
    ).mockImplementation(({ accept }) => accept?.());

    component.confirmDelete(mockUsers[0]);
    expect(userServiceMock.delete).toHaveBeenCalledWith('uuid-1');
    confirmSpy.mockRestore();
  });
});

