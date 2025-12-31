import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

function isApiUrl(url: string): boolean {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.startsWith(environment.apiBaseUrl);
  }
  return url.startsWith('/api');
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const request = isApiUrl(req.url)
    ? req.clone({ withCredentials: true })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) =>
      throwError(() => error)
    )
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};