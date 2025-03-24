import { Url } from "../../models/Url";

export interface IUrlShortenerService {
  shortenUrl(originalUrl: string, customSlug?: string): Promise<Url>;
  getOriginalUrl(shortId: string): Promise<string | null>;
}
