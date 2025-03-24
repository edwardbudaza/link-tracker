import { Url } from '../../models/Url';

export interface IUrlService {
  createUrl(originalUrl: string, userId: string): Promise<Url>;
  getUrlByShortId(shortId: string): Promise<Url | null>;
  getUrlsByUserId(userId: string): Promise<Url[]>;
  deleteUrl(urlId: string, userId: string): Promise<boolean>;
  updateUrl(urlId: string, userId: string, updates: Partial<Url>): Promise<Url | null>;
  incrementClicks(shortId: string): Promise<void>;
  getUrlStats(shortId: string): Promise<{
    totalClicks: number;
    lastClicked?: Date;
    createdAt: Date;
  }>;
} 