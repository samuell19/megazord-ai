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

export interface Session {
  id: string;
  agentId: string;
  userId: string;
  title?: string;
  emoji?: string;
  description?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  tokensUsed?: number;
  processingTimeMs?: number;
  error?: string;
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
  sessionId?: string;
}

interface MessageResponse {
  status: number;
  message: string;
  data?: {
    response: string;
    model: string;
    tokensUsed?: number;
    sessionId: string;
    messageId: string;
  };
  timestamp: string;
}

interface SessionResponse {
  status: number;
  message: string;
  data?: Session;
  timestamp: string;
}

interface SessionListResponse {
  status: number;
  message: string;
  data?: Session[];
  timestamp: string;
}

interface MessageListResponse {
  status: number;
  message: string;
  data?: Message[];
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

  // Session methods
  createSession(agentId: string, title?: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(
      `${environment.apiUrl}/sessions`,
      { agentId, title },
      { headers: this.getHeaders() }
    );
  }

  listSessions(agentId: string): Observable<SessionListResponse> {
    return this.http.get<SessionListResponse>(
      `${environment.apiUrl}/sessions/agent/${agentId}`,
      { headers: this.getHeaders() }
    );
  }

  getSession(sessionId: string): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(
      `${environment.apiUrl}/sessions/${sessionId}`,
      { headers: this.getHeaders() }
    );
  }

  getSessionMessages(sessionId: string): Observable<MessageListResponse> {
    return this.http.get<MessageListResponse>(
      `${environment.apiUrl}/sessions/${sessionId}/messages`,
      { headers: this.getHeaders() }
    );
  }

  updateSession(sessionId: string, data: { title?: string; isActive?: boolean }): Observable<SessionResponse> {
    return this.http.put<SessionResponse>(
      `${environment.apiUrl}/sessions/${sessionId}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  deleteSession(sessionId: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/sessions/${sessionId}`,
      { headers: this.getHeaders() }
    );
  }
}

export type { MessageRequest };
