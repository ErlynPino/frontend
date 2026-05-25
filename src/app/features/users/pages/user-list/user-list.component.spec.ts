import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../../../core/services/user.service';
import { ConfirmationService } from 'primeng/api';
import { UserRole } from '../../../../core/models/user.model';

const mockUsers = [
  { id: 1, username: 'admin', full_name: 'Admin User', email: 'admin@latam.com', role: 'admin' as UserRole, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 2, username: 'jdoe', full_name: 'John Doe', email: 'jdoe@latam.com', role: 'user' as UserRole, is_active: false, created_at: '2024-02-01', updated_at: '2024-02-01' },
];

const userServiceMock = {
  users: signal(mockUsers),
  loading: signal(false),
  total: signal(2),
  activeUsers: signal([mockUsers[0]]),
  inactiveUsers: signal([mockUsers[1]]),
  loadUsers: jest.fn(),
  delete: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
};

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
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

  it('should call loadUsers on init', () => {
    expect(userServiceMock.loadUsers).toHaveBeenCalled();
  });

  it('should return correct avatar color based on username', () => {
    const color = component.avatarColor('admin');
    expect(color).toBeTruthy();
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('should return correct role label', () => {
    expect(component.roleLabel('admin')).toBe('Administrador');
    expect(component.roleLabel('moderator')).toBe('Moderador');
    expect(component.roleLabel('user')).toBe('Usuario');
  });

  it('should return correct role severity', () => {
    expect(component.roleSeverity('admin')).toBe('danger');
    expect(component.roleSeverity('moderator')).toBe('warn');
    expect(component.roleSeverity('user')).toBe('info');
    expect(component.roleSeverity('unknown')).toBe('secondary');
  });

  it('should have 5 skeleton rows', () => {
    expect(component.skeletonRows.length).toBe(5);
  });
});
