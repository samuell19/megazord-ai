import axios, { AxiosInstance, AxiosError } from 'axios';

interface OpenRouterMessage {
  role: string;
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

class OpenRouterService {
  private client: AxiosInstance;
  private baseURL: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second base delay

  constructor() {
    this.baseURL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60 seconds
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CORS_ORIGIN || 'http://localhost:4200',
        'X-Title': 'Megazord AI'
      }
    });
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isRetryableError(error: AxiosError): boolean {
    // Retry on 5xx errors (server errors) and network errors
    if (!error.response) {
      return true; // Network error
    }
    
    const status = error.response.status;
    return status >= 500 && status < 600;
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // Check if we should retry
      if (attempt < this.maxRetries && this.isRetryableError(axiosError)) {
        // Calculate exponential backoff: 1s, 2s, 4s
        const delay = this.retryDelay * Math.pow(2, attempt);
        
        console.log(`Retry attempt ${attempt + 1}/${this.maxRetries} after ${delay}ms`);
        await this.sleep(delay);
        
        return this.retryWithBackoff(operation, attempt + 1);
      }
      
      // No more retries or non-retryable error
      throw error;
    }
  }

  async sendMessage(
    apiKey: string,
    model: string,
    messages: OpenRouterMessage[]
  ): Promise<OpenRouterResponse> {
    const operation = async () => {
      const response = await this.client.post<OpenRouterResponse>(
        '/chat/completions',
        {
          model,
          messages
        } as OpenRouterRequest,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      return response.data;
    };

    try {
      return await this.retryWithBackoff(operation);
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // Server responded with error
        const status = axiosError.response.status;
        const data = axiosError.response.data as any;
        
        if (status === 401) {
          throw new Error('Invalid API key');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (status === 400) {
          throw new Error(`Invalid request: ${data?.error?.message || 'Bad request'}`);
        } else if (status >= 500) {
          throw new Error('OpenRouter service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`OpenRouter error: ${data?.error?.message || 'Unknown error'}`);
        }
      } else if (axiosError.request) {
        // Request made but no response
        throw new Error('Unable to reach OpenRouter. Please check your internet connection.');
      } else {
        // Error setting up request
        throw new Error(`Request error: ${axiosError.message}`);
      }
    }
  }

  async getAvailableModels(apiKey: string): Promise<OpenRouterModel[]> {
    try {
      const response = await this.client.get<{ data: OpenRouterModel[] }>(
        '/models',
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 401) {
        throw new Error('Invalid API key');
      }
      
      throw new Error('Failed to fetch available models from OpenRouter');
    }
  }
}

export default OpenRouterService;
export { OpenRouterMessage, OpenRouterRequest, OpenRouterResponse, OpenRouterModel };
