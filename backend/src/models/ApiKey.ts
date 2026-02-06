import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

interface ApiKeyAttributes {
  id: string;
  userId: string;
  encryptedKey: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ApiKeyCreationAttributes extends Optional<ApiKeyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ApiKey extends Model<ApiKeyAttributes, ApiKeyCreationAttributes> implements ApiKeyAttributes {
  public id!: string;
  public userId!: string;
  public encryptedKey!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize): typeof ApiKey {
    ApiKey.init(
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
          unique: true,
          field: 'user_id',
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        encryptedKey: {
          type: DataTypes.TEXT,
          allowNull: false,
          field: 'encrypted_key'
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
        tableName: 'api_keys',
        underscored: true,
        timestamps: true
      }
    );
    return ApiKey;
  }
}

export default ApiKey;
export { ApiKeyAttributes, ApiKeyCreationAttributes };
