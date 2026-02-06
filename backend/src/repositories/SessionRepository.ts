import Session from '../models/Session';
import Message from '../models/Message';

class SessionRepository {
  async create(data: {
    agentId: string;
    userId: string;
    title?: string;
    metadata?: Record<string, any>;
  }): Promise<Session> {
    return await Session.create(data);
  }

  async findById(id: string): Promise<Session | null> {
    return await Session.findByPk(id);
  }

  async findByAgent(agentId: string, userId: string): Promise<Session[]> {
    return await Session.findAll({
      where: {
        agentId,
        userId
      },
      order: [['lastMessageAt', 'DESC'], ['createdAt', 'DESC']],
      limit: 50
    });
  }

  async findByUser(userId: string): Promise<Session[]> {
    return await Session.findAll({
      where: {
        userId
      },
      order: [['lastMessageAt', 'DESC'], ['createdAt', 'DESC']],
      limit: 50
    });
  }

  async update(id: string, data: Partial<{
    title: string;
    emoji: string;
    description: string;
    metadata: Record<string, any>;
    isActive: boolean;
    lastMessageAt: Date;
  }>): Promise<Session | null> {
    const session = await Session.findByPk(id);
    if (!session) {
      return null;
    }

    await session.update(data);
    return session;
  }

  async delete(id: string): Promise<boolean> {
    const result = await Session.destroy({
      where: { id }
    });
    return result > 0;
  }

  async updateLastMessageAt(id: string): Promise<void> {
    await Session.update(
      { lastMessageAt: new Date() },
      { where: { id } }
    );
  }
}

export default SessionRepository;
