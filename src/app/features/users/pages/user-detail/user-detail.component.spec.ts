import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { UserDetailComponent } from './user-detail.component';
import { UserService } from '../../../../core/services/user.service';
import { User, UserRole } from '../../../../core/models/user.model';

@Component({ standalone: true, template: '' })
class DummyComponent {}

const mockUser: User = {
  id: 'uuid-1',
  username: 'jdoe',
  first_name: 'John',
  last_name: 'Doe',
  email: 'jdoe@example.com',
  role: 'admin' as UserRole,
  active: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-03-20T14:30:00Z',
};

const userServiceMock = {
  loading: signal(false),
  selectedUser: signal<User | null>(mockUser),
  getById: jest.fn().mockReturnValue(of(mockUser)),
};

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [UserDetailComponent, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'users', component: DummyComponent },
          { path: 'users/:id/edit', component: DummyComponent },
        ]),
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'uuid-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('llama getById con el UUID correcto al inicializar', () => {
    expect(userServiceMock.getById).toHaveBeenCalledWith('uuid-1');
  });

  it('avatarColor devuelve un color hexadecimal válido', () => {
    const color = component.avatarColor('jdoe');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  // ── Tests de integración del template ──────────────────────────────

  it('muestra el nombre completo del usuario en el perfil', () => {
    expect(fixture.nativeElement.textContent).toContain('John Doe');
  });

  it('muestra el username del usuario', () => {
    expect(fixture.nativeElement.textContent).toContain('jdoe');
  });

  it('muestra la etiqueta "Administrador" para rol admin', () => {
    expect(fixture.nativeElement.textContent).toContain('Administrador');
  });

  it('muestra badge de rol con severity "danger" para admin', () => {
    const tags = fixture.debugElement.queryAll(By.css('p-tag'));
    const hasDanger = tags.some((tag) => {
      const sev = tag.componentInstance.severity;
      return (typeof sev === 'function' ? sev() : sev) === 'danger';
    });
    expect(hasDanger).toBe(true);
  });

  it('muestra badge "Activo" para usuario activo', () => {
    expect(fixture.nativeElement.textContent).toContain('Activo');
  });

  it('muestra badge de estado con severity "success" para usuario activo', () => {
    const tags = fixture.debugElement.queryAll(By.css('p-tag'));
    const hasSuccess = tags.some((tag) => {
      const sev = tag.componentInstance.severity;
      return (typeof sev === 'function' ? sev() : sev) === 'success';
    });
    expect(hasSuccess).toBe(true);
  });

  it('muestra "Inactivo" para usuario inactivo', () => {
    userServiceMock.selectedUser.set({ ...mockUser, active: false });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Inactivo');
  });
});

