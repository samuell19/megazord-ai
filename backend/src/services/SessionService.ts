import SessionRepository from '../repositories/SessionRepository';
import AgentRepository from '../repositories/AgentRepository';
import Session from '../models/Session';

class SessionService {
  private sessionRepository: SessionRepository;
  private agentRepository: AgentRepository;

  constructor() {
    this.sessionRepository = new SessionRepository();
    this.agentRepository = new AgentRepository();
  }

  async create(userId: string, agentId: string, title?: string): Promise<Session> {
    // Verify agent ownership
    const agent = await this.agentRepository.findById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    if (agent.userId !== userId) {
      throw new Error('Access denied. This agent belongs to another user.');
    }

    // Generate default title if not provided
    const sessionTitle = title || `New conversation - ${new Date().toLocaleString()}`;

    return await this.sessionRepository.create({
      agentId,
      userId,
      title: sessionTitle,
      metadata: {}
    });
  }

  async findById(id: string, userId: string): Promise<Session | null> {
    const session = await this.sessionRepository.findById(id);
    
    if (!session) {
      return null;
    }

    // Verify ownership
    if (session.userId !== userId) {
      throw new Error('Access denied. This session belongs to another user.');
    }

    return session;
  }

  async findByAgent(agentId: string, userId: string): Promise<Session[]> {
    // Verify agent ownership
    const agent = await this.agentRepository.findById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    if (agent.userId !== userId) {
      throw new Error('Access denied. This agent belongs to another user.');
    }

    return await this.sessionRepository.findByAgent(agentId, userId);
  }

  async findByUser(userId: string): Promise<Session[]> {
    return await this.sessionRepository.findByUser(userId);
  }

  async update(id: string, userId: string, data: {
    title?: string;
    metadata?: Record<string, any>;
    isActive?: boolean;
  }): Promise<Session> {
    const session = await this.findById(id, userId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const updated = await this.sessionRepository.update(id, data);
    
    if (!updated) {
      throw new Error('Failed to update session');
    }

    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const session = await this.findById(id, userId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    await this.sessionRepository.delete(id);
  }

  async updateLastMessageAt(id: string): Promise<void> {
    await this.sessionRepository.updateLastMessageAt(id);
  }
}

export default SessionService;
