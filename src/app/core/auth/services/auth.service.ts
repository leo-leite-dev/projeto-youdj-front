import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { LoginRequest } from '../contracts/login-request.model';
import { LoginResponse } from '../contracts/login-response.model';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);

  private readonly baseUrl = `${environment.apiBaseUrl}/dj/auth`;

  loginDj(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, payload)
      .pipe(
        tap(user => this.session.start(user))
      );
  }

  me(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(
      `${this.baseUrl}/me`,
      { withCredentials: true }
    );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => this.session.clear())
      );
  }
}