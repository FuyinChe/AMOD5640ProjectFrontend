import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: {
    id: number;
    email: string;
    username?: string;
  };
}

export interface RefreshResponse {
  access: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private usernameKey = 'username';
  private emailKey = 'email';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in on service initialization
    this.checkAuthStatus();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.API_BASE_URL}/token`, {
      username: email,
      password
    }).pipe(
      tap(response => {
        this.storeTokens(response.access, response.refresh);
        this.storeUserInfo(email, response.user?.username || email);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshResponse>(`${environment.API_BASE_URL}/token/refresh`, {
      refresh: refreshToken
    }).pipe(
      tap(response => {
        this.storeAccessToken(response.access);
      }),
      catchError(error => {
        // If refresh fails, logout user
        this.logout();
        return throwError(() => error);
      })
    );
  }

  storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  storeAccessToken(accessToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
  }

  storeUserInfo(email: string, username?: string): void {
    localStorage.setItem(this.emailKey, email);
    if (username) {
      localStorage.setItem(this.usernameKey, username);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getEmail(): string | null {
    return localStorage.getItem(this.emailKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return tokenData.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  checkAuthStatus(): void {
    const isLoggedIn = this.isLoggedIn();
    this.isAuthenticatedSubject.next(isLoggedIn);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.emailKey);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/welcome']);
  }

  /**
   * Get user info from backend
   */
  getUserInfo(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${environment.API_BASE_URL}/userinfo/`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get HTTP headers with authorization token
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your network connection or try again later.';
      } else if (error.status === 401) {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (error.status === 400) {
        errorMessage = error.error?.detail || 'Bad request. Please check your input.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.error?.detail || 'An unexpected error occurred. Please try again.';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
