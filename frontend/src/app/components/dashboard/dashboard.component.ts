import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgentService, Agent } from '../../services/agent.service';
import { ApiKeyService } from '../../services/api-key.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private agentService = inject(AgentService);
  private apiKeyService = inject(ApiKeyService);
  private authService = inject(AuthService);
  private router = inject(Router);

  agents: Agent[] = [];
  hasApiKey: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';
  currentUser: any = null;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.checkApiKey();
  }

  checkApiKey(): void {
    this.apiKeyService.get().subscribe({
      next: (response) => {
        this.hasApiKey = !!response.data;
        this.loadAgents();
      },
      error: (error) => {
        // 404 means no API key exists
        this.hasApiKey = false;
        this.isLoading = false;
      }
    });
  }

  loadAgents(): void {
    this.agentService.list().subscribe({
      next: (response) => {
        this.agents = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load agents';
      }
    });
  }

  navigateToAgent(agentId: string): void {
    this.router.navigate(['/agents', agentId]);
  }

  navigateToCreateAgent(): void {
    this.router.navigate(['/agents/create']);
  }

  navigateToApiKeyConfig(): void {
    this.router.navigate(['/settings/api-key']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if logout fails on server, clear local storage
        this.router.navigate(['/login']);
      }
    });
  }
}
