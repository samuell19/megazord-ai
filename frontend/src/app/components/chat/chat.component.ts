import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgentService, Agent, Session, Message } from '../../services/agent.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private agentService = inject(AgentService);

  agent: Agent | null = null;
  session: Session | null = null;
  messages: Message[] = [];
  currentMessage: string = '';
  isSending: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';

  ngOnInit(): void {
    const agentId = this.route.snapshot.paramMap.get('agentId');
    const sessionId = this.route.snapshot.paramMap.get('sessionId');

    if (agentId && sessionId) {
      this.loadAgent(agentId);
      this.loadSession(sessionId);
      this.loadMessages(sessionId);
    }
  }

  loadAgent(id: string): void {
    this.agentService.get(id).subscribe({
      next: (response) => {
        this.agent = response.data || null;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load agent';
      }
    });
  }

  loadSession(sessionId: string): void {
    this.agentService.getSession(sessionId).subscribe({
      next: (response) => {
        this.session = response.data || null;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load session';
      }
    });
  }

  loadMessages(sessionId: string): void {
    this.agentService.getSessionMessages(sessionId).subscribe({
      next: (response) => {
        this.messages = response.data || [];
      },
      error: (error) => {
        this.errorMessage = 'Failed to load messages';
      }
    });
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || !this.agent || !this.session || this.isSending) {
      return;
    }

    const messageToSend = this.currentMessage;
    this.currentMessage = '';
    this.isSending = true;
    this.errorMessage = '';

    this.agentService.sendMessage(this.agent.id, {
      message: messageToSend,
      sessionId: this.session.id
    }).subscribe({
      next: (response) => {
        this.isSending = false;
        if (response.data) {
          this.loadMessages(this.session!.id);
        }
      },
      error: (error) => {
        this.isSending = false;
        this.errorMessage = error.error?.message || 'Failed to send message';
      }
    });
  }

  goBack(): void {
    if (this.agent) {
      this.router.navigate(['/agents', this.agent.id]);
    }
  }
}
