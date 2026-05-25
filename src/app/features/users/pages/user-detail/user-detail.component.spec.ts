import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
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

  it('roleLabel devuelve etiqueta correcta para admin', () => {
    expect(component.roleLabel('admin')).toBe('Administrador');
  });

  it('roleLabel devuelve "Invitado" para guest (no "Moderador")', () => {
    expect(component.roleLabel('guest')).toBe('Invitado');
  });

  it('roleLabel devuelve "Usuario" para user', () => {
    expect(component.roleLabel('user')).toBe('Usuario');
  });

  it('roleSeverity devuelve "danger" para admin', () => {
    expect(component.roleSeverity('admin')).toBe('danger');
  });

  it('roleSeverity devuelve "secondary" para guest', () => {
    expect(component.roleSeverity('guest')).toBe('secondary');
  });

  it('roleSeverity devuelve "info" para user', () => {
    expect(component.roleSeverity('user')).toBe('info');
  });
});

