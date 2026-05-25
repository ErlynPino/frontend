import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

/**
 * errorInterceptor — intercepta errores HTTP globalmente y muestra toasts
 * con PrimeNG MessageService (OCP: no modifica los servicios existentes).
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const messages = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let detail = 'Ocurrió un error inesperado.';

      if (error.status === 0) {
        detail = 'No se pudo conectar con el servidor.';
      } else if (error.status === 404) {
        detail = 'El recurso solicitado no existe.';
      } else if (error.status === 409) {
        detail = error.error?.detail ?? 'Conflicto: dato duplicado.';
      } else if (error.status === 422) {
        const apiDetail = error.error?.detail;
        if (Array.isArray(apiDetail) && apiDetail.length > 0) {
          // FastAPI devuelve un array de errores de validación
          detail = apiDetail
            .map((e: { loc: string[]; msg: string }) =>
              `${e.loc[e.loc.length - 1]}: ${e.msg}`
            )
            .join(' · ');
        } else if (typeof apiDetail === 'string') {
          detail = apiDetail;
        } else {
          detail = 'Datos inválidos. Revisa el formulario.';
        }
      } else if (error.status >= 500) {
        detail = 'Error interno del servidor. Intenta más tarde.';
      }

      messages.add({ severity: 'error', summary: 'Error', detail, life: 5000 });

      return throwError(() => new Error(detail));
    }),
  );
};
