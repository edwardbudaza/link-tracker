import { IUrlRepository } from "../interfaces/repositories/IUrlRepository";
import UrlModel, { Url } from "../models/Url";
import { injectable } from "inversify";
import { logger } from "../config/logger";

@injectable()
export class UrlRepository implements IUrlRepository {
  private readonly logger = logger;

  async create(url: Partial<Url>): Promise<Url> {
    const newUrl = new UrlModel(url);
    return await newUrl.save();
  }

  async findByShortId(shortId: string): Promise<Url | null> {
    return await UrlModel.findOne({ shortId, isActive: true });
  }

  async findByOriginalUrl(originalUrl: string): Promise<Url | null> {
    return await UrlModel.findOne({ originalUrl, isActive: true });
  }

  async updateById(id: string, url: Partial<Url>): Promise<Url | null> {
    return await UrlModel.findByIdAndUpdate(id, url, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await UrlModel.findByIdAndUpdate(id, { isActive: false });
    return !!result;
  }

  async findByUserId(
    userId: string, 
    options?: { skip?: number; limit?: number }
  ): Promise<Url[]> {
    try {
      const query = UrlModel.find({ creator: userId });
      
      if (options?.skip !== undefined) {
        query.skip(options.skip);
      }
      
      if (options?.limit !== undefined) {
        query.limit(options.limit);
      }
      
      // Sort by creation date descending (newest first)
      query.sort({ createdAt: -1 });
      
      return await query.exec();
    } catch (error) {
      this.logger.error("Error finding URLs by user ID", { error: (error as Error).message, stack: (error as Error).stack });
      return [];
    }
  }

  async countByUserId(userId: string): Promise<number> {
    try {
      return await UrlModel.countDocuments({ creator: userId });
    } catch (error) {
      this.logger.error("Error counting URLs by user ID", { error: (error as Error).message, stack: (error as Error).stack });
      return 0;
    }
  }
}
