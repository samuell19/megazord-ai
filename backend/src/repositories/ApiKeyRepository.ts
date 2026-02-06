import ApiKey from '../models/ApiKey';

interface CreateApiKeyData {
  userId: string;
  encryptedKey: string;
}

class ApiKeyRepository {
  async create(data: CreateApiKeyData): Promise<ApiKey> {
    return await ApiKey.create(data);
  }

  async findByUser(userId: string): Promise<ApiKey | null> {
    return await ApiKey.findOne({
      where: { userId }
    });
  }

  async update(userId: string, encryptedKey: string): Promise<ApiKey> {
    const apiKey = await this.findByUser(userId);
    if (!apiKey) {
      throw new Error('API key not found');
    }
    apiKey.encryptedKey = encryptedKey;
    await apiKey.save();
    return apiKey;
  }

  async delete(userId: string): Promise<void> {
    const apiKey = await this.findByUser(userId);
    if (apiKey) {
      await apiKey.destroy();
    }
  }
}

export default ApiKeyRepository;
export { CreateApiKeyData };
