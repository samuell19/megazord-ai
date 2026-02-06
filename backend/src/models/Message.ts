import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

type MessageRole = 'user' | 'assistant' | 'system';

interface MessageAttributes {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, any>;
  tokensUsed?: number;
  processingTimeMs?: number;
  error?: string;
  parentMessageId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'metadata' | 'tokensUsed' | 'processingTimeMs' | 'error' | 'parentMessageId' | 'createdAt' | 'updatedAt'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: string;
  public sessionId!: string;
  public role!: MessageRole;
  public content!: string;
  public metadata?: Record<string, any>;
  public tokensUsed?: number;
  public processingTimeMs?: number;
  public error?: string;
  public parentMessageId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize): typeof Message {
    Message.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        sessionId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'session_id'
        },
        role: {
          type: DataTypes.ENUM('user', 'assistant', 'system'),
          allowNull: false
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        metadata: {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: {}
        },
        tokensUsed: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'tokens_used'
        },
        processingTimeMs: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'processing_time_ms'
        },
        error: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        parentMessageId: {
          type: DataTypes.UUID,
          allowNull: true,
          field: 'parent_message_id'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at'
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at'
        }
      },
      {
        sequelize,
        tableName: 'messages',
        timestamps: true,
        underscored: true
      }
    );

    return Message;
  }
}

export default Message;
