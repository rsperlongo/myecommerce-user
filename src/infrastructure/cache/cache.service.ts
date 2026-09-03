import { Injectable } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private redisClient: Redis;

  constructor(private redisService: RedisService) {
    this.redisClient = this.redisService.getOrThrow();
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.setex(key, ttl, JSON.stringify(value));
    } else {
      await this.redisClient.set(key, JSON.stringify(value));
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async clear(): Promise<void> {
    await this.redisClient.flushdb();
  }
}
