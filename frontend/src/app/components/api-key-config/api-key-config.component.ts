import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiKeyService } from '../../services/api-key.service';

@Component({
  selector: 'app-api-key-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './api-key-config.component.html',
  styleUrls: ['./api-key-config.component.scss']
})
export class ApiKeyConfigComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private apiKeyService = inject(ApiKeyService);
  private router = inject(Router);

  apiKeyForm: FormGroup;
  hasExistingKey: boolean = false;
  maskedKey: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor() {
    this.apiKeyForm = this.formBuilder.group({
      key: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadExistingKey();
  }

  loadExistingKey(): void {
    this.isLoading = true;
    this.apiKeyService.get().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.data) {
          this.hasExistingKey = true;
          this.maskedKey = response.data.maskedKey;
        }
      },
      error: (error) => {
        this.isLoading = false;
        // 404 means no key exists yet, which is fine
        if (error.status !== 404) {
          this.errorMessage = 'Failed to load API key';
        }
      }
    });
  }

  onSubmit(): void {
    if (this.apiKeyForm.invalid) {
      this.apiKeyForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { key } = this.apiKeyForm.value;
    const operation = this.hasExistingKey
      ? this.apiKeyService.update(key)
      : this.apiKeyService.store(key);

    operation.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = this.hasExistingKey
          ? 'API key updated successfully'
          : 'API key stored successfully';
        
        if (response.data) {
          this.hasExistingKey = true;
          this.maskedKey = response.data.maskedKey;
        }
        
        this.apiKeyForm.reset();
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to save API key';
      }
    });
  }

  onDelete(): void {
    if (!confirm('Are you sure you want to delete your API key? This action cannot be undone.')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiKeyService.delete().subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'API key deleted successfully';
        this.hasExistingKey = false;
        this.maskedKey = '';
        this.apiKeyForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete API key';
      }
    });
  }

  get key() {
    return this.apiKeyForm.get('key');
  }
}
