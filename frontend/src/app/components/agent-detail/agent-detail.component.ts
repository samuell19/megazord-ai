import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgentService, Agent } from '../../services/agent.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-agent-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-detail.component.html',
  styleUrls: ['./agent-detail.component.scss']
})
export class AgentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private agentService = inject(AgentService);

  agent: Agent | null = null;
  messages: Message[] = [];
  currentMessage: string = '';
  isLoading: boolean = true;
  isSending: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    const agentId = this.route.snapshot.paramMap.get('id');
    if (agentId) {
      this.loadAgent(agentId);
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

  sendMessage(): void {
    if (!this.currentMessage.trim() || !this.agent || this.isSending) {
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: this.currentMessage,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const messageToSend = this.currentMessage;
    this.currentMessage = '';
    this.isSending = true;
    this.errorMessage = '';

    const conversationHistory = this.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    this.agentService.sendMessage(this.agent.id, {
      message: messageToSend,
      conversationHistory: conversationHistory.slice(0, -1) // Exclude the current message
    }).subscribe({
      next: (response) => {
        this.isSending = false;
        if (response.data) {
          const assistantMessage: Message = {
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date()
          };
          this.messages.push(assistantMessage);
        }
      },
      error: (error) => {
        this.isSending = false;
        this.errorMessage = error.error?.message || 'Failed to send message';
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
