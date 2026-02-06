import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

interface UserAttributes {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public username!: string;
  public passwordHash!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initUserModel(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Must be a valid email address'
          },
          notEmpty: {
            msg: 'Email cannot be empty'
          }
        }
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          len: {
            args: [3, 100],
            msg: 'Username must be between 3 and 100 characters'
          },
          notEmpty: {
            msg: 'Username cannot be empty'
          }
        }
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
        validate: {
          notEmpty: {
            msg: 'Password hash cannot be empty'
          }
        }
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
      tableName: 'users',
      underscored: true,
      timestamps: true
    }
  );
  return User;
}

export default User;
export { UserAttributes, UserCreationAttributes };
