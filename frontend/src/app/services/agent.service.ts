import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Agent {
  id: string;
  userId: string;
  name: string;
  model: string;
  configuration: {
    temperature?: number;
    max_tokens?: number;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

interface AgentResponse {
  status: number;
  message: string;
  data?: Agent;
  timestamp: string;
}

interface AgentListResponse {
  status: number;
  message: string;
  data?: Agent[];
  timestamp: string;
}

interface MessageRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

interface MessageResponse {
  status: number;
  message: string;
  data?: {
    response: string;
    model: string;
    tokensUsed?: number;
  };
  timestamp: string;
}

interface ModelsResponse {
  status: number;
  message: string;
  data?: OpenRouterModel[];
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = `${environment.apiUrl}/agents`;
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  create(agent: Partial<Agent>): Observable<AgentResponse> {
    return this.http.post<AgentResponse>(
      this.apiUrl,
      agent,
      { headers: this.getHeaders() }
    );
  }

  list(): Observable<AgentListResponse> {
    return this.http.get<AgentListResponse>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  get(id: string): Observable<AgentResponse> {
    return this.http.get<AgentResponse>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  update(id: string, agent: Partial<Agent>): Observable<AgentResponse> {
    return this.http.put<AgentResponse>(
      `${this.apiUrl}/${id}`,
      agent,
      { headers: this.getHeaders() }
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  sendMessage(id: string, request: MessageRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/${id}/message`,
      request,
      { headers: this.getHeaders() }
    );
  }

  getAvailableModels(): Observable<ModelsResponse> {
    return this.http.get<ModelsResponse>(
      `${this.apiUrl}/models`,
      { headers: this.getHeaders() }
    );
  }
}
