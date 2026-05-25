import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the API status indicator', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.topbar__status')).toBeTruthy();
  });

  it('should render the user avatar', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.topbar__user-avatar')).toBeTruthy();
  });

  it('should show breadcrumb', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.topbar__breadcrumb')).toBeTruthy();
  });
});

