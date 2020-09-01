import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { IdentityService } from '../identity/identity.service';
import { environment } from '@env/environment';
import { User } from '@app/models';

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient, private identity: IdentityService) {}

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<LoginResponse>(`${environment.dataService}/login`, {
        username: email,
        password,
      })
      .pipe(
        tap(res => {
          if (res.success) {
            this.identity.set(res.user, res.token);
          }
        }),
        map(res => res.success),
      );
  }

  logout(): Observable<any> {
    return this.http
      .post(`${environment.dataService}/logout`, {})
      .pipe(tap(() => this.identity.clear()));
  }
}
