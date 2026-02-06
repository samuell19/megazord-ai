import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface SessionAttributes {
  id: string;
  agentId: string;
  userId: string;
  title?: string;
  emoji?: string;
  description?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  lastMessageAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SessionCreationAttributes extends Optional<SessionAttributes, 'id' | 'title' | 'emoji' | 'description' | 'metadata' | 'isActive' | 'lastMessageAt' | 'createdAt' | 'updatedAt'> {}

class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  public id!: string;
  public agentId!: string;
  public userId!: string;
  public title?: string;
  public emoji?: string;
  public description?: string;
  public metadata?: Record<string, any>;
  public isActive!: boolean;
  public lastMessageAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize): typeof Session {
    Session.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        agentId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'agent_id'
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'user_id'
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        emoji: {
          type: DataTypes.STRING(10),
          allowNull: true,
          defaultValue: '💬'
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        metadata: {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: {}
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: 'is_active'
        },
        lastMessageAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'last_message_at'
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
        tableName: 'sessions',
        timestamps: true,
        underscored: true
      }
    );

    return Session;
  }
}

export default Session;
