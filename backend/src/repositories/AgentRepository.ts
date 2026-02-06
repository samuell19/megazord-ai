import Agent from '../models/Agent';

interface CreateAgentData {
  userId: string;
  name: string;
  model: string;
  configuration?: Record<string, any>;
}

class AgentRepository {
  async create(data: CreateAgentData): Promise<Agent> {
    return await Agent.create({
      userId: data.userId,
      name: data.name,
      model: data.model,
      configuration: data.configuration || {}
    });
  }

  async findByUser(userId: string): Promise<Agent[]> {
    return await Agent.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  async findById(id: string): Promise<Agent | null> {
    return await Agent.findByPk(id);
  }

  async update(id: string, data: Partial<Agent>): Promise<Agent> {
    const agent = await this.findById(id);
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    if (data.name !== undefined) agent.name = data.name;
    if (data.model !== undefined) agent.model = data.model;
    if (data.configuration !== undefined) agent.configuration = data.configuration;
    
    await agent.save();
    return agent;
  }

  async delete(id: string): Promise<void> {
    const agent = await this.findById(id);
    if (agent) {
      await agent.destroy();
    }
  }
}

export default AgentRepository;
export { CreateAgentData };
