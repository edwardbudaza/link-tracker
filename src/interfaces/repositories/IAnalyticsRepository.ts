import { ClickEvent } from "../../models/ClickEvent";

export interface IAnalyticsRepository {
  createClickEvent(clickEvent: Partial<ClickEvent>): Promise<ClickEvent>;
  getClicksByUrlId(urlId: string): Promise<ClickEvent[]>;
  getClicksByDateRange(startDate: Date, endDate: Date): Promise<ClickEvent[]>;
  getTopClicks(limit: number): Promise<{ url: string; clicks: number }[]>;
}
