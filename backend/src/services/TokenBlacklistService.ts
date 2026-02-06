// Simple in-memory token blacklist
// In production, use Redis or database
class TokenBlacklistService {
  private blacklist: Set<string> = new Set();

  addToken(token: string): void {
    this.blacklist.add(token);
  }

  isBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }

  removeToken(token: string): void {
    this.blacklist.delete(token);
  }

  clear(): void {
    this.blacklist.clear();
  }
}

// Singleton instance
const tokenBlacklistService = new TokenBlacklistService();

export default tokenBlacklistService;
