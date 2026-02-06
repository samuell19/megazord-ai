import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

interface ApiKeyResponse {
  status: number;
  message: string;
  data?: {
    id: string;
    maskedKey: string;
    createdAt: string;
    updatedAt: string;
  };
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {
  private apiUrl = `${environment.apiUrl}/api-keys`;
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  store(key: string): Observable<ApiKeyResponse> {
    return this.http.post<ApiKeyResponse>(
      this.apiUrl,
      { key },
      { headers: this.getHeaders() }
    );
  }

  get(): Observable<ApiKeyResponse> {
    return this.http.get<ApiKeyResponse>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  update(key: string): Observable<ApiKeyResponse> {
    return this.http.put<ApiKeyResponse>(
      this.apiUrl,
      { key },
      { headers: this.getHeaders() }
    );
  }

  delete(): Observable<ApiKeyResponse> {
    return this.http.delete<ApiKeyResponse>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }
}
