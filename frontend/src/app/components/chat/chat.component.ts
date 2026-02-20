import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgentService, Agent, Session, Message } from '../../services/agent.service';

interface Particle {
  x: number;
  y: number;
  delay: number;
  duration: number;
}

interface FutureTool {
  icon: string;
  name: string;
  status: string;
  progress: number;
  description: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesArea') private messagesArea!: ElementRef;

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
  latency: number = 42;

  // Background particles
  particles: Particle[] = [];

  // Suggested prompts for Jarvis-style floating bubbles
  suggestedPrompts: string[] = [
    'Explain this project architecture',
    'Generate a unit test suite',
    'Optimize the current code',
    'Create a new API endpoint'
  ];

  // Future tool mockups for the HUD cards
  futureTools: FutureTool[] = [
    { icon: '🔗', name: 'WEB SEARCH', status: 'SOON', progress: 75, description: 'Real-time web data retrieval' },
    { icon: '📊', name: 'ANALYTICS', status: 'BETA', progress: 60, description: 'Session usage metrics' },
    { icon: '🖼️', name: 'VISION', status: 'ALPHA', progress: 40, description: 'Image analysis pipeline' },
    { icon: '🔧', name: 'CODE EXEC', status: 'DEV', progress: 25, description: 'Sandboxed code runner' }
  ];

  private shouldScroll = false;

  constructor() {
    // Generate random particles for background
    this.particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 8
    }));
  }

  ngOnInit(): void {
    const agentId = this.route.snapshot.paramMap.get('agentId');
    const sessionId = this.route.snapshot.paramMap.get('sessionId');

    if (agentId && sessionId) {
      this.loadAgent(agentId);
      this.loadSession(sessionId);
      this.loadMessages(sessionId);
    }

    // Simulate fluctuating latency for HUD effect
    setInterval(() => {
      this.latency = 30 + Math.floor(Math.random() * 50);
    }, 3000);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
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
        this.shouldScroll = true;
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

  usePrompt(prompt: string): void {
    if (prompt) {
      this.currentMessage = prompt;
      this.sendMessage();
    }
  }

  onEnterKey(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey) {
      keyEvent.preventDefault();
      this.sendMessage();
    }
  }

  goBack(): void {
    if (this.agent) {
      this.router.navigate(['/agents', this.agent.id]);
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesArea) {
        this.messagesArea.nativeElement.scrollTop = this.messagesArea.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
