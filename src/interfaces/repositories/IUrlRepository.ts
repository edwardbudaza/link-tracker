import { Url } from "../../models/Url";

export interface IUrlRepository {
  create(url: Partial<Url>): Promise<Url>;
  findByShortId(shortId: string): Promise<Url | null>;
  findByOriginalUrl(originalUrl: string): Promise<Url | null>;
  updateById(id: string, url: Partial<Url>): Promise<Url | null>;
  delete(id: string): Promise<boolean>;
}
