import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [TagModule],
})
export class HeaderComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly apiStatus = signal<'checking' | 'ok' | 'error'>('checking');

  ngOnInit(): void {
    this.http.get('https://user-api-5ouc5o5dia-uc.a.run.app/health').subscribe({
      next: () => this.apiStatus.set('ok'),
      error: () => this.apiStatus.set('error'),
    });
  }
}

