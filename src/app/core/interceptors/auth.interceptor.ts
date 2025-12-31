import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

function isApiUrl(url: string): boolean {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url.startsWith(environment.apiBaseUrl);
    }

    return url.startsWith('/api');
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    intercept<T>(
        req: HttpRequest<T>,
        next: HttpHandler
    ): Observable<HttpEvent<T>> {

        const isApi = isApiUrl(req.url);
        const request = isApi
            ? req.clone({ withCredentials: true })
            : req;

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }
}