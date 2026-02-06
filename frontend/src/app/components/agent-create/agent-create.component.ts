import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgentService, OpenRouterModel } from '../../services/agent.service';

@Component({
  selector: 'app-agent-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './agent-create.component.html',
  styleUrls: ['./agent-create.component.scss']
})
export class AgentCreateComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private agentService = inject(AgentService);
  private router = inject(Router);

  agentForm: FormGroup;
  models: OpenRouterModel[] = [];
  isLoadingModels: boolean = true;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor() {
    this.agentForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      model: ['', [Validators.required]],
      temperature: [0.7, [Validators.min(0), Validators.max(2)]],
      max_tokens: [2000, [Validators.min(1), Validators.max(100000)]]
    });
  }

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    this.agentService.getAvailableModels().subscribe({
      next: (response) => {
        this.models = response.data || [];
        this.isLoadingModels = false;
      },
      error: (error) => {
        this.isLoadingModels = false;
        this.errorMessage = error.error?.message || 'Failed to load models. Please check your API key.';
      }
    });
  }

  onSubmit(): void {
    if (this.agentForm.invalid) {
      this.agentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { name, model, temperature, max_tokens } = this.agentForm.value;

    this.agentService.create({
      name,
      model,
      configuration: {
        temperature,
        max_tokens
      }
    }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.data) {
          this.router.navigate(['/agents', response.data.id]);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to create agent';
      }
    });
  }

  get name() {
    return this.agentForm.get('name');
  }

  get model() {
    return this.agentForm.get('model');
  }
}
