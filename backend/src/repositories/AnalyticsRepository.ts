import { timeStamp } from "console";
import { IAnalyticsRepository } from "../interfaces/repositories/IAnalyticsRepository";
import ClickEventModel, { ClickEvent } from "../models/ClickEvent";
import UrlModel from "../models/Url";
import { injectable } from "inversify";

@injectable()
export class AnalyticsRepository implements IAnalyticsRepository {
  async createClickEvent(clickEvent: Partial<ClickEvent>): Promise<ClickEvent> {
    const newClickEvent = new ClickEventModel(clickEvent);
    return await newClickEvent.save();
  }

  async getClicksByUrlId(urlId: string): Promise<ClickEvent[]> {
    return await ClickEventModel.find({ urlId }).sort({ timestamp: -1 });
  }

  async getClicksByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ClickEvent[]> {
    return await ClickEventModel.find({
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ timestamp: -1 });
  }

  async getTopClicks(
    limit: number
  ): Promise<{ url: string; clicks: number }[]> {
    const result = await UrlModel.aggregate([
      { $match: { isActive: true } },
      { $sort: { clicks: -1 } },
      { $limit: limit },
      { $project: { _id: 0, originalUrl: 1, shortId: 1, clicks: 1 } },
    ]);

    return result.map((item) => ({
      url: item.originalUrl,
      shortId: item.shortId,
      clicks: item.clicks,
    }));
  }
}
