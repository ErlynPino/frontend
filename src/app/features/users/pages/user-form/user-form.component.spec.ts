import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UserFormComponent } from './user-form.component';
import { UserService } from '../../../../core/services/user.service';

const userServiceMock = {
  loading: signal(false),
  getById: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
  create: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
  update: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
};

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormComponent, RouterTestingModule, NoopAnimationsModule, ReactiveFormsModule],
      providers: [{ provide: UserService, useValue: userServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in create mode when no id is provided', () => {
    expect(component.isEdit).toBe(false);
  });

  it('should be in edit mode when id input is provided', () => {
    fixture.componentRef.setInput('id', '42');
    fixture.detectChanges();
    expect(component.isEdit).toBe(true);
  });

  it('should have an invalid form initially (create mode)', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should mark form as touched when submitting an invalid form', () => {
    component.submit();
    expect(component.form.touched).toBe(true);
  });

  it('should detect invalid fields after touching', () => {
    component.form.get('username')?.markAsTouched();
    expect(component.fieldInvalid('username')).toBe(true);
  });

  it('should have the correct number of roles', () => {
    expect(component.roles.length).toBe(3);
  });

  it('should expose role descriptions for all roles', () => {
    expect(component.roleDescriptions['admin']).toBeTruthy();
    expect(component.roleDescriptions['moderator']).toBeTruthy();
    expect(component.roleDescriptions['user']).toBeTruthy();
  });
});
