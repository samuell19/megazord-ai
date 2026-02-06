import User from '../models/User';

interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
}

class UserRepository {
  async create(data: CreateUserData): Promise<User> {
    return await User.create(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({
      where: { email }
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await User.findOne({
      where: { username }
    });
  }

  async findById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  async delete(id: string): Promise<void> {
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
    }
  }
}

export default UserRepository;
export { CreateUserData };
