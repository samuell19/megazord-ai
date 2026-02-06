import Message from '../models/Message';
import Attachment from '../models/Attachment';

class MessageRepository {
  async create(data: {
    sessionId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: Record<string, any>;
    tokensUsed?: number;
    processingTimeMs?: number;
    error?: string;
    parentMessageId?: string;
  }): Promise<Message> {
    return await Message.create(data);
  }

  async findById(id: string): Promise<Message | null> {
    return await Message.findByPk(id, {
      include: [{
        model: Attachment,
        as: 'attachments'
      }]
    });
  }

  async findBySession(sessionId: string, limit?: number): Promise<Message[]> {
    return await Message.findAll({
      where: {
        sessionId
      },
      include: [{
        model: Attachment,
        as: 'attachments'
      }],
      order: [['createdAt', 'ASC']],
      limit: limit || 1000
    });
  }

  async update(id: string, data: Partial<{
    content: string;
    metadata: Record<string, any>;
    error: string;
  }>): Promise<Message | null> {
    const message = await Message.findByPk(id);
    if (!message) {
      return null;
    }

    await message.update(data);
    return message;
  }

  async delete(id: string): Promise<boolean> {
    const result = await Message.destroy({
      where: { id }
    });
    return result > 0;
  }

  async countBySession(sessionId: string): Promise<number> {
    return await Message.count({
      where: { sessionId }
    });
  }
}

export default MessageRepository;
