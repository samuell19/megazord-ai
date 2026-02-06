import AgentRepository from '../repositories/AgentRepository';
import SessionRepository from '../repositories/SessionRepository';
import MessageRepository from '../repositories/MessageRepository';
import ApiKeyService from './ApiKeyService';
import OpenRouterService, { OpenRouterMessage } from './OpenRouterService';

interface MessageRequest {
  message: string;
  sessionId?: string;
}

interface MessageResponse {
  response: string;
  model: string;
  tokensUsed?: number;
  sessionId: string;
  messageId: string;
}

class MessageProcessor {
  private agentRepository: AgentRepository;
  private sessionRepository: SessionRepository;
  private messageRepository: MessageRepository;
  private apiKeyService: ApiKeyService;
  private openRouterService: OpenRouterService;
  private maxRecursionDepth: number = 5;

  constructor() {
    this.agentRepository = new AgentRepository();
    this.sessionRepository = new SessionRepository();
    this.messageRepository = new MessageRepository();
    this.apiKeyService = new ApiKeyService();
    this.openRouterService = new OpenRouterService();
  }

  async process(
    agentId: string,
    userId: string,
    request: MessageRequest,
    recursionDepth: number = 0
  ): Promise<MessageResponse> {
    const startTime = Date.now();

    // Check recursion limit
    if (recursionDepth >= this.maxRecursionDepth) {
      throw new Error(`Maximum recursion depth of ${this.maxRecursionDepth} exceeded`);
    }

    // Retrieve agent configuration
    const agent = await this.agentRepository.findById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Verify ownership
    if (agent.userId !== userId) {
      throw new Error('Access denied. This agent belongs to another user.');
    }

    // Get or create session
    let sessionId = request.sessionId;
    if (!sessionId) {
      // Create new session if not provided
      const session = await this.sessionRepository.create({
        agentId,
        userId,
        title: `New conversation - ${new Date().toLocaleString()}`,
        metadata: {}
      });
      sessionId = session.id;
    } else {
      // Verify session ownership
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      if (session.userId !== userId) {
        throw new Error('Access denied. This session belongs to another user.');
      }
    }

    // Save user message
    const userMessage = await this.messageRepository.create({
      sessionId,
      role: 'user',
      content: request.message,
      metadata: {}
    });

    // Retrieve and decrypt user's API key
    const apiKey = await this.apiKeyService.getDecrypted(userId);
    if (!apiKey) {
      throw new Error('API key not configured. Please configure your OpenRouter API key first.');
    }

    // Load conversation history from database
    const historyMessages = await this.messageRepository.findBySession(sessionId, 50);
    
    // Build messages array for OpenRouter (exclude the last user message we just saved)
    const messages: OpenRouterMessage[] = historyMessages
      .filter(msg => msg.id !== userMessage.id)
      .map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

    // Add current message
    messages.push({
      role: 'user',
      content: request.message
    });

    // Call OpenRouter
    try {
      const response = await this.openRouterService.sendMessage(
        apiKey,
        agent.model,
        messages
      );

      const processingTime = Date.now() - startTime;

      // Extract response
      const assistantMessage = response.choices[0]?.message?.content || '';
      
      // Save assistant message
      const savedAssistantMessage = await this.messageRepository.create({
        sessionId,
        role: 'assistant',
        content: assistantMessage,
        metadata: {
          model: response.model,
          finishReason: response.choices[0]?.finish_reason
        },
        tokensUsed: response.usage?.total_tokens,
        processingTimeMs: processingTime
      });

      // Update session's last message timestamp
      await this.sessionRepository.updateLastMessageAt(sessionId);

      return {
        response: assistantMessage,
        model: response.model,
        tokensUsed: response.usage?.total_tokens,
        sessionId,
        messageId: savedAssistantMessage.id
      };
    } catch (error) {
      // Save error in user message
      await this.messageRepository.update(userMessage.id, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Failed to process message: ${error.message}`);
      }
      throw new Error('Failed to process message: Unknown error');
    }
  }
}

export default MessageProcessor;
export { MessageRequest, MessageResponse };
