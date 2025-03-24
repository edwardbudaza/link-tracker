import { Url } from "../../models/Url";

export interface IUrlRepository {
  create(url: Partial<Url>): Promise<Url>;
  findByShortId(shortId: string): Promise<Url | null>;
  findByOriginalUrl(originalUrl: string): Promise<Url | null>;
  updateById(id: string, update: Partial<Url>): Promise<Url | null>;
  findByUserId(userId: string, options?: { skip?: number; limit?: number }): Promise<Url[]>;
  countByUserId(userId: string): Promise<number>;
  delete(id: string): Promise<boolean>;
}
