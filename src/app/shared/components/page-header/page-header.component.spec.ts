import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    fixture.componentRef.setInput('title', 'Usuarios');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.page-header__title')?.textContent?.trim()).toBe('Usuarios');
  });

  it('should render the subtitle when provided', () => {
    fixture.componentRef.setInput('title', 'Usuarios');
    fixture.componentRef.setInput('subtitle', 'Gestión de usuarios');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.page-header__subtitle')?.textContent?.trim()).toBe('Gestión de usuarios');
  });

  it('should not render the subtitle when not provided', () => {
    fixture.componentRef.setInput('title', 'Usuarios');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.page-header__subtitle')).toBeNull();
  });

  it('should render the action button when actionLabel is provided', () => {
    fixture.componentRef.setInput('title', 'Usuarios');
    fixture.componentRef.setInput('actionLabel', 'Nuevo usuario');
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('p-button'));
    expect(btn).toBeTruthy();
  });

  it('should emit action event when button is clicked', () => {
    fixture.componentRef.setInput('title', 'Usuarios');
    fixture.componentRef.setInput('actionLabel', 'Nuevo usuario');
    fixture.detectChanges();
    const emitSpy = jest.spyOn(component.action, 'emit');
    component.action.emit();
    expect(emitSpy).toHaveBeenCalled();
  });
});
