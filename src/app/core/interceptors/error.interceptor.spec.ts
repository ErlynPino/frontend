import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        MessageService,
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    messageService = TestBed.inject(MessageService);
    jest.spyOn(messageService, 'add');
  });

  afterEach(() => httpMock.verify());

  const triggerError = (status: number, body?: object) => {
    let error: Error | undefined;
    http.get('/test').subscribe({ error: (e) => (error = e) });
    httpMock.expectOne('/test').flush(body ?? { detail: 'Error' }, { status, statusText: 'Error' });
    return error;
  };

  it('muestra toast en error 0 (sin conexión)', () => {
    http.get('/test').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/test');
    req.error(new ProgressEvent('error'));
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: expect.stringContaining('servidor') }),
    );
  });

  it('muestra toast en error 404', () => {
    triggerError(404);
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ detail: expect.stringContaining('no existe') }),
    );
  });

  it('muestra toast en error 409', () => {
    triggerError(409, { detail: 'Username ya existe' });
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });

  it('muestra toast en error 422 con fallback cuando detail no es string ni array', () => {
    triggerError(422, { detail: null });
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ detail: expect.stringContaining('formulario') }),
    );
  });

  it('muestra toast en error 500', () => {
    triggerError(500);
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ detail: expect.stringContaining('interno') }),
    );
  });

  it('re-lanza el error para que el subscriber lo maneje', () => {
    const err = triggerError(404);
    expect(err).toBeInstanceOf(Error);
  });
});

