import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthResponse {
  status: number;
  message: string;
  data: {
    token: string;
    user: User;
  };
  timestamp: string;
}

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Load user from localStorage on service initialization (only in browser)
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;
    
    const token = this.getToken();
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        this.clearStorage();
      }
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      })
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      })
    );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(() => {
        this.clearStorage();
        this.currentUserSubject.next(null);
      })
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (!this.isBrowser) return;
    
    const { token, user } = response.data;
    
    // Store token and user in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Update current user subject
    this.currentUserSubject.next(user);
  }

  private clearStorage(): void {
    if (!this.isBrowser) return;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Check if token is expired (basic JWT expiration check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiry;
    } catch (error) {
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
