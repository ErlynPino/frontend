import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { UserDetailComponent } from './user-detail.component';
import { UserService } from '../../../../core/services/user.service';
import { UserRole } from '../../../../core/models/user.model';

const mockUser = {
  id: 1,
  username: 'jdoe',
  full_name: 'John Doe',
  email: 'jdoe@latam.com',
  role: 'admin' as UserRole,
  is_active: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-03-20T14:30:00Z',
};

const userServiceMock = {
  loading: signal(false),
  selectedUser: signal(mockUser),
  getById: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
};

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: UserService, useValue: userServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getById on init with the correct id', () => {
    expect(userServiceMock.getById).toHaveBeenCalledWith(1);
  });

  it('should return correct avatar color', () => {
    const color = component.avatarColor('jdoe');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('should return correct role labels', () => {
    expect(component.roleLabel('admin')).toBe('Administrador');
    expect(component.roleLabel('moderator')).toBe('Moderador');
    expect(component.roleLabel('user')).toBe('Usuario');
  });

  it('should return correct severity for role', () => {
    expect(component.roleSeverity('admin')).toBe('danger');
    expect(component.roleSeverity('moderator')).toBe('warn');
    expect(component.roleSeverity('user')).toBe('info');
  });
});
