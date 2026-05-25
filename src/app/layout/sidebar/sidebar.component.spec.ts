import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have at least one navigation section', () => {
    expect(component.navSections.length).toBeGreaterThan(0);
  });

  it('should have navigation items inside each section', () => {
    component.navSections.forEach((section) => {
      expect(section.items.length).toBeGreaterThan(0);
    });
  });

  it('should render the LATAM brand name', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.sidebar__brand-name')?.textContent?.trim()).toBe('LATAM');
  });

  it('should render navigation links', () => {
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('.sidebar__item');
    expect(links.length).toBeGreaterThan(0);
  });
});

