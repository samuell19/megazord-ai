import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

interface AgentAttributes {
  id: string;
  userId: string;
  name: string;
  model: string;
  configuration: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AgentCreationAttributes extends Optional<AgentAttributes, 'id' | 'configuration' | 'createdAt' | 'updatedAt'> {}

class Agent extends Model<AgentAttributes, AgentCreationAttributes> implements AgentAttributes {
  public id!: string;
  public userId!: string;
  public name!: string;
  public model!: string;
  public configuration!: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize): typeof Agent {
    Agent.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'user_id',
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            len: {
              args: [1, 255],
              msg: 'Name must be between 1 and 255 characters'
            },
            notEmpty: {
              msg: 'Name cannot be empty'
            }
          }
        },
        model: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: 'Model cannot be empty'
            }
          }
        },
        configuration: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {}
        },
        createdAt: {
          type: DataTypes.DATE,
          field: 'created_at'
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: 'updated_at'
        }
      },
      {
        sequelize,
        tableName: 'agents',
        underscored: true,
        timestamps: true
      }
    );
    return Agent;
  }
}

export default Agent;
export { AgentAttributes, AgentCreationAttributes };
