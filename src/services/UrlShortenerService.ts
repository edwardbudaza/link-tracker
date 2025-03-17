import { injectable, inject } from "inversify";
import { IUrlShortenerService } from "../interfaces/services/IUrlShortenerService";
import { IUrlRepository } from "../interfaces/repositories/IUrlRepository";
import { ILoggingService } from "../interfaces/services/ILoggingService";
import { generateShortId, isValidUrl } from "../utils/urlGenerator";
import { Url } from "../models/Url";
import { getRedisClient } from "../config/redis";
import { REDIS_CONFIG } from "../config/redis";
import { TYPES } from "../di/types";

@injectable()
export class UrlShortenerService implements IUrlShortenerService {
  constructor(
    @inject(TYPES.UrlRepository) private urlRepository: IUrlRepository,
    @inject(TYPES.LoggingService) private logger: ILoggingService
  ) {}

  async shortenUrl(originalUrl: string, customSlug?: string): Promise<Url> {
    if (!isValidUrl(originalUrl)) {
      throw new Error("Invalid URL format");
    }

    // Check if URL already exists in the database
    const existingUrl = await this.urlRepository.findByOriginalUrl(originalUrl);
    if (existingUrl && !customSlug) {
      return existingUrl;
    }

    // Generate a short ID or use custom slug
    const shortId = customSlug || generateShortId();

    // Check if custom slug is already in use
    if (customSlug) {
      const existingSlug = await this.urlRepository.findByShortId(customSlug);
      if (existingSlug) {
        throw new Error("Custom slug already in use");
      }
    }

    // Create new URL entry
    const newUrl = await this.urlRepository.create({
      originalUrl,
      shortId,
      customSlug: customSlug || undefined,
      createdAt: new Date(),
      clicks: 0,
      isActive: true,
    });

    this.logger.info("URL shortened successfully", {
      originalUrl,
      shortId,
      customSlug: customSlug || undefined,
    });

    return newUrl;
  }

  async getOriginalUrl(shortId: string): Promise<string | null> {
    try {
      // Try to get from Redis cache first
      const redisClient = await getRedisClient();
      const cachedUrl = await redisClient.get(`url:${shortId}`);

      if (cachedUrl) {
        this.logger.debug("URL retrieved from cache", { shortId });
        return cachedUrl;
      }

      // If not in cache, get from database
      const url = await this.urlRepository.findByShortId(shortId);

      if (!url) {
        this.logger.warn("URL not found", { shortId });
        return null;
      }

      //  Update click count
      await this.urlRepository.updateById(url._id as unknown as string, {
        clicks: url.clicks + 1,
      });

      // Cache the result for future requests
      await redisClient.set(`url:${shortId}`, url.originalUrl, {
        EX: REDIS_CONFIG.ttl,
      });

      return url.originalUrl;
    } catch (error) {
      this.logger.error("Error retrieving original URL", error as Error, {
        shortId,
      });
      throw error;
    }
  }
}
