import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { LoginResponse, RegisterResponse } from '../model/user';

const ACCOUNT = `${environment.api}/Account`;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${ACCOUNT}/login`, { email, password });
  }

  refreshToken(refreshToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${ACCOUNT}/refresh-token`, JSON.stringify(refreshToken), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  register(
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.api}/account/register`, {
      firstName,
      lastName,
      username,
      email,
      password,
    });
  }
}
