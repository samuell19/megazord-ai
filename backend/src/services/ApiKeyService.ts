import crypto from 'crypto';
import ApiKeyRepository from '../repositories/ApiKeyRepository';

interface ApiKeyResponse {
  id: string;
  maskedKey: string;
  createdAt: Date;
  updatedAt: Date;
}

class ApiKeyService {
  private apiKeyRepository: ApiKeyRepository;
  private algorithm: string = 'aes-256-cbc';
  private encryptionKey: Buffer;

  constructor() {
    this.apiKeyRepository = new ApiKeyRepository();
    
    // Get encryption key from environment (must be 32 bytes for AES-256)
    const key = process.env.ENCRYPTION_KEY || 'megazord-encryption-key-32chars';
    // Ensure key is exactly 32 bytes
    this.encryptionKey = Buffer.from(key.padEnd(32, '0').substring(0, 32));
  }

  encrypt(key: string): string {
    // Generate random IV (16 bytes for AES)
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    // Encrypt the key
    let encrypted = cipher.update(key, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data (IV is needed for decryption)
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedKey: string): string {
    // Split IV and encrypted data
    const parts = encryptedKey.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted key format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    
    // Decrypt the key
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  mask(key: string): string {
    if (key.length <= 8) {
      return '***';
    }
    // Show first 4 and last 4 characters
    const first = key.substring(0, 4);
    const last = key.substring(key.length - 4);
    return `${first}...${last}`;
  }

  async store(userId: string, key: string): Promise<ApiKeyResponse> {
    // Check if user already has an API key
    const existing = await this.apiKeyRepository.findByUser(userId);
    if (existing) {
      throw new Error('User already has an API key. Use update instead.');
    }

    // Encrypt the key
    const encryptedKey = this.encrypt(key);

    // Store in database
    const apiKey = await this.apiKeyRepository.create({
      userId,
      encryptedKey
    });

    return {
      id: apiKey.id,
      maskedKey: this.mask(key),
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt
    };
  }

  async get(userId: string): Promise<ApiKeyResponse | null> {
    const apiKey = await this.apiKeyRepository.findByUser(userId);
    if (!apiKey) {
      return null;
    }

    // Decrypt to get original key for masking
    const decryptedKey = this.decrypt(apiKey.encryptedKey);

    return {
      id: apiKey.id,
      maskedKey: this.mask(decryptedKey),
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt
    };
  }

  async update(userId: string, key: string): Promise<ApiKeyResponse> {
    // Encrypt the new key
    const encryptedKey = this.encrypt(key);

    // Update in database
    const apiKey = await this.apiKeyRepository.update(userId, encryptedKey);

    return {
      id: apiKey.id,
      maskedKey: this.mask(key),
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt
    };
  }

  async delete(userId: string): Promise<void> {
    await this.apiKeyRepository.delete(userId);
  }

  async getDecrypted(userId: string): Promise<string | null> {
    const apiKey = await this.apiKeyRepository.findByUser(userId);
    if (!apiKey) {
      return null;
    }

    return this.decrypt(apiKey.encryptedKey);
  }
}

export default ApiKeyService;
export { ApiKeyResponse };
