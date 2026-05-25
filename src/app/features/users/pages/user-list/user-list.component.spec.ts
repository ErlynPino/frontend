import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../../../core/services/user.service';
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
  error: signal<string | null>(null),
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

  // ── Tests de integración del template ──────────────────────────────

  it('muestra badge "danger" para rol admin en la tabla', () => {
    userServiceMock.users.set([makeUser({ role: 'admin', active: true })]);
    fixture.detectChanges();
    const tags = fixture.debugElement.queryAll(By.css('p-tag'));
    const hasDanger = tags.some((tag) => {
      const sev = tag.componentInstance.severity;
      return (typeof sev === 'function' ? sev() : sev) === 'danger';
    });
    expect(hasDanger).toBe(true);
  });

  it('muestra badge "info" para rol user en la tabla', () => {
    userServiceMock.users.set([makeUser({ role: 'user', active: false })]);
    fixture.detectChanges();
    const tags = fixture.debugElement.queryAll(By.css('p-tag'));
    const hasInfo = tags.some((tag) => {
      const sev = tag.componentInstance.severity;
      return (typeof sev === 'function' ? sev() : sev) === 'info';
    });
    expect(hasInfo).toBe(true);
  });

  it('muestra badge "secondary" para rol guest en la tabla', () => {
    userServiceMock.users.set([makeUser({ role: 'guest', active: true })]);
    fixture.detectChanges();
    const tags = fixture.debugElement.queryAll(By.css('p-tag'));
    const hasSecondary = tags.some((tag) => {
      const sev = tag.componentInstance.severity;
      return (typeof sev === 'function' ? sev() : sev) === 'secondary';
    });
    expect(hasSecondary).toBe(true);
  });

  it('muestra etiqueta "Administrador" para rol admin en la tabla', () => {
    userServiceMock.users.set([makeUser({ role: 'admin' })]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Administrador');
  });

  // ── Acciones con diálogo de confirmación ────────────────────────────

  it('confirmDelete abre el diálogo de confirmación con severity "danger"', () => {
    component.confirmDelete(mockUsers[0]);
    expect(component.dialogVisible()).toBe(true);
    expect(component.dialogConfig().confirmSeverity).toBe('danger');
  });

  it('al confirmar el diálogo, confirmDelete llama delete del servicio', () => {
    component.confirmDelete(mockUsers[0]);
    component.onDialogConfirmed();
    expect(userServiceMock.delete).toHaveBeenCalledWith('uuid-1');
  });

  it('toggleStatus abre el diálogo con severity "warn" para usuario activo', () => {
    const user = makeUser({ active: true });
    component.toggleStatus(user);
    expect(component.dialogVisible()).toBe(true);
    expect(component.dialogConfig().confirmSeverity).toBe('warn');
  });

  it('al confirmar el diálogo, toggleStatus llama update con active invertido', () => {
    const user = makeUser({ active: true });
    component.toggleStatus(user);
    component.onDialogConfirmed();
    expect(userServiceMock.update).toHaveBeenCalledWith('uuid-1', { active: false });
  });
});

