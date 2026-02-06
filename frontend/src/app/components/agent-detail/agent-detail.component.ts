import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgentService, Agent, Session } from '../../services/agent.service';

@Component({
  selector: 'app-agent-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-detail.component.html',
  styleUrls: ['./agent-detail.component.scss']
})
export class AgentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private agentService = inject(AgentService);

  agent: Agent | null = null;
  sessions: Session[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  ngOnInit(): void {
    const agentId = this.route.snapshot.paramMap.get('id');
    if (agentId) {
      this.loadAgent(agentId);
      this.loadSessions(agentId);
    }
  }

  loadAgent(id: string): void {
    this.agentService.get(id).subscribe({
      next: (response) => {
        this.agent = response.data || null;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load agent';
      }
    });
  }

  loadSessions(agentId: string): void {
    this.agentService.listSessions(agentId).subscribe({
      next: (response) => {
        this.sessions = response.data || [];
      },
      error: (error) => {
        console.error('Failed to load sessions', error);
      }
    });
  }

  createNewSession(): void {
    if (!this.agent) return;

    this.agentService.createSession(this.agent.id).subscribe({
      next: (response) => {
        if (response.data) {
          // Navigate to chat with new session
          this.router.navigate(['/agents', this.agent!.id, 'chat', response.data.id]);
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to create session';
      }
    });
  }

  openSession(session: Session): void {
    if (!this.agent) return;
    this.router.navigate(['/agents', this.agent.id, 'chat', session.id]);
  }

  deleteSession(session: Session, event: Event): void {
    event.stopPropagation();
    
    if (!confirm(`Delete session "${session.title || 'New Conversation'}"?`)) {
      return;
    }

    this.agentService.deleteSession(session.id).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.id !== session.id);
      },
      error: (error) => {
        this.errorMessage = 'Failed to delete session';
      }
    });
  }

  deleteAgent(): void {
    if (!this.agent || !confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    this.agentService.delete(this.agent.id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = 'Failed to delete agent';
      }
    });
  }
}
