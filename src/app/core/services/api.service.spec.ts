import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

const BASE = environment.apiUrl;

describe('ApiService', () => {
  let service: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('hace GET sin params', () => {
      service.get('/users').subscribe();
      const req = http.expectOne(`${BASE}/users`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('hace GET con query params', () => {
      service.get('/users', { skip: 0, limit: 10 }).subscribe();
      const req = http.expectOne((r) => r.url === `${BASE}/users`);
      expect(req.request.params.get('skip')).toBe('0');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush([]);
    });
  });

  describe('post()', () => {
    it('hace POST con el body correcto', () => {
      const body = { username: 'jdoe', email: 'j@test.com' };
      service.post('/users', body).subscribe();
      const req = http.expectOne(`${BASE}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({ id: '1', ...body });
    });
  });

  describe('put()', () => {
    it('hace PUT con el body correcto', () => {
      const body = { username: 'jdoe2' };
      service.put('/users/abc', body).subscribe();
      const req = http.expectOne(`${BASE}/users/abc`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush({});
    });
  });

  describe('patch()', () => {
    it('hace PATCH con el body correcto', () => {
      service.patch('/users/abc', { active: false }).subscribe();
      const req = http.expectOne(`${BASE}/users/abc`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
    });
  });

  describe('delete()', () => {
    it('hace DELETE al endpoint correcto', () => {
      service.delete('/users/abc').subscribe();
      const req = http.expectOne(`${BASE}/users/abc`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});

