import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { UserFormComponent } from './user-form.component';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';

@Component({ standalone: true, template: '' })
class DummyComponent {}

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

const userServiceMock = {
  loading: signal(false),
  getById: jest.fn().mockReturnValue(of(mockUser)),
  create: jest.fn().mockReturnValue(of(mockUser)),
  update: jest.fn().mockReturnValue(of(mockUser)),
  fullUpdate: jest.fn().mockReturnValue(of(mockUser)),
};

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [UserFormComponent, NoopAnimationsModule, ReactiveFormsModule],
      providers: [
        provideRouter([
          { path: 'users', component: DummyComponent },
          { path: 'users/:id/edit', component: DummyComponent },
        ]),
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('modo creación cuando no hay id', () => {
    expect(component.isEdit).toBe(false);
  });

  it('modo edición cuando hay id', () => {
    fixture.componentRef.setInput('id', 'uuid-1');
    fixture.detectChanges();
    expect(component.isEdit).toBe(true);
  });

  it('formulario inválido al inicio en modo creación', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('marca todos los campos como touched si se envía formulario inválido', () => {
    component.submit();
    expect(component.form.touched).toBe(true);
  });

  it('fieldInvalid devuelve true para campo tocado con error', () => {
    component.form.get('username')?.markAsTouched();
    expect(component.fieldInvalid('username')).toBe(true);
  });

  it('fieldInvalid devuelve false para campo válido', () => {
    component.form.get('username')?.setValue('validuser');
    component.form.get('username')?.markAsTouched();
    expect(component.fieldInvalid('username')).toBe(false);
  });

  it('tiene exactamente 3 roles (admin, guest, user)', () => {
    expect(component.roles).toHaveLength(3);
    const values = component.roles.map((r) => r.value);
    expect(values).toContain('admin');
    expect(values).toContain('guest');
    expect(values).toContain('user');
  });

  it('roleDescriptions incluye guest (no moderator)', () => {
    expect(component.roleDescriptions['guest']).toBeTruthy();
    expect(component.roleDescriptions['moderator']).toBeFalsy();
  });

  it('en creación, submit válido abre el diálogo de confirmación', () => {
    component.form.patchValue({
      username: 'newuser',
      email: 'new@example.com',
      first_name: 'New',
      last_name: 'User',
      role: 'user',
      active: true,
    });
    component.submit();
    expect(component.dialogVisible()).toBe(true);
  });

  it('al confirmar en modo creación, llama create()', () => {
    component.form.patchValue({
      username: 'newuser',
      email: 'new@example.com',
      first_name: 'New',
      last_name: 'User',
      role: 'user',
      active: true,
    });
    component.onConfirmed();
    expect(userServiceMock.create).toHaveBeenCalled();
  });

  it('en edición, submit válido abre el diálogo de confirmación', () => {
    fixture.componentRef.setInput('id', 'uuid-1');
    fixture.detectChanges();
    component.form.patchValue({
      username: 'edituser',
      email: 'edit@example.com',
      first_name: 'Edit',
      last_name: 'User',
      role: 'admin',
      active: false,
    });
    component.submit();
    expect(component.dialogVisible()).toBe(true);
  });

  it('al confirmar en modo edición, llama fullUpdate() (PUT)', () => {
    fixture.componentRef.setInput('id', 'uuid-1');
    fixture.detectChanges();
    component.form.patchValue({
      username: 'edituser',
      email: 'edit@example.com',
      first_name: 'Edit',
      last_name: 'User',
      role: 'admin',
      active: false,
    });
    component.onConfirmed();
    expect(userServiceMock.fullUpdate).toHaveBeenCalled();
  });
});

