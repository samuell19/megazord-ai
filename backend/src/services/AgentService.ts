import AgentRepository from '../repositories/AgentRepository';
import ApiKeyRepository from '../repositories/ApiKeyRepository';
import Agent from '../models/Agent';

interface CreateAgentDTO {
  name: string;
  model: string;
  configuration?: Record<string, any>;
}

interface UpdateAgentDTO {
  name?: string;
  model?: string;
  configuration?: Record<string, any>;
}

class AgentService {
  private agentRepository: AgentRepository;
  private apiKeyRepository: ApiKeyRepository;

  constructor() {
    this.agentRepository = new AgentRepository();
    this.apiKeyRepository = new ApiKeyRepository();
  }

  async create(userId: string, data: CreateAgentDTO): Promise<Agent> {
    // Check if user has API key configured
    const apiKey = await this.apiKeyRepository.findByUser(userId);
    if (!apiKey) {
      throw new Error('API key not configured. Please configure your OpenRouter API key first.');
    }

    return await this.agentRepository.create({
      userId,
      name: data.name,
      model: data.model,
      configuration: data.configuration
    });
  }

  async findByUser(userId: string): Promise<Agent[]> {
    return await this.agentRepository.findByUser(userId);
  }

  async findById(agentId: string, userId: string): Promise<Agent | null> {
    const agent = await this.agentRepository.findById(agentId);
    
    // Verify ownership
    if (agent && agent.userId !== userId) {
      throw new Error('Access denied. This agent belongs to another user.');
    }
    
    return agent;
  }

  async update(agentId: string, userId: string, data: UpdateAgentDTO): Promise<Agent> {
    // Verify ownership first
    const agent = await this.findById(agentId, userId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    return await this.agentRepository.update(agentId, data);
  }

  async delete(agentId: string, userId: string): Promise<void> {
    // Verify ownership first
    const agent = await this.findById(agentId, userId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    await this.agentRepository.delete(agentId);
  }
}

export default AgentService;
export { CreateAgentDTO, UpdateAgentDTO };
