import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LoginResponse } from '../contracts/login-response.model';

@Injectable({ providedIn: 'root' })
export class SessionService {

  private readonly _user$ = new BehaviorSubject<LoginResponse | null>(null);
  private readonly _isAuth$ = new BehaviorSubject<boolean>(false);
  private readonly _ready$ = new BehaviorSubject<boolean>(false);

  readonly user$ = this._user$.asObservable();
  readonly isAuthenticated$ = this._isAuth$.asObservable();
  readonly ready$ = this._ready$.asObservable();

  readonly dj$ = this.user$.pipe(
    filter((user): user is LoginResponse => user !== null)
  );

  readonly djId$ = this.dj$.pipe(
    map(user => user.djId)
  );

  userSnapshot() {
    return this._user$.value;
  }

  isAuthenticatedSnapshot() {
    return this._isAuth$.value;
  }

  isReadySnapshot() {
    return this._ready$.value;
  }

  start(user: LoginResponse) {
    this._user$.next(user);
    this._isAuth$.next(true);
    this._ready$.next(true);
  }

  refresh(user: LoginResponse) {
    this.start(user);
  }

  clear() {
    this._user$.next(null);
    this._isAuth$.next(false);
    this._ready$.next(true);
  }
}