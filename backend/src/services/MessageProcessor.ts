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

      // Generate session metadata if not already set (after 2+ messages)
      const messageCount = await this.messageRepository.countBySession(sessionId);
      if (messageCount >= 4) { // 2 user + 2 assistant messages
        const session = await this.sessionRepository.findById(sessionId);
        if (session && !session.title?.includes('New conversation')) {
          // Already has a custom title, skip generation
        } else {
          // Generate title, description, and emoji
          await this.generateSessionMetadata(sessionId, userId, agent.model, apiKey);
        }
      }

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

  private async generateSessionMetadata(
    sessionId: string,
    userId: string,
    model: string,
    apiKey: string
  ): Promise<void> {
    try {
      // Get conversation history
      const messages = await this.messageRepository.findBySession(sessionId, 10);
      
      // Build conversation summary
      const conversationText = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      // Ask AI to generate metadata
      const prompt = `Based on this conversation, generate a JSON object with:
- title: A short, descriptive title (max 50 chars)
- description: A brief summary (max 100 chars)
- emoji: A single relevant emoji

Conversation:
${conversationText}

Respond ONLY with valid JSON in this exact format:
{"title": "...", "description": "...", "emoji": "..."}`;

      const response = await this.openRouterService.sendMessage(
        apiKey,
        model,
        [{ role: 'user', content: prompt }]
      );

      const aiResponse = response.choices[0]?.message?.content || '';
      
      // Parse JSON response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const metadata = JSON.parse(jsonMatch[0]);
        
        // Update session with generated metadata
        await this.sessionRepository.update(sessionId, {
          title: metadata.title || 'Conversation',
          description: metadata.description || '',
          emoji: metadata.emoji || '💬'
        });
      }
    } catch (error) {
      // Silently fail - metadata generation is not critical
      console.error('Failed to generate session metadata:', error);
    }
  }
}

export default MessageProcessor;
export { MessageRequest, MessageResponse };
