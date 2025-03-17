import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { IAnalyticsRepository } from "../interfaces/repositories/IAnalyticsRepository";
import { ILoggingService } from "../interfaces/services/ILoggingService";
import { TYPES } from "../di/types";

@injectable()
export class AnalyticsController {
  constructor(
    @inject(TYPES.AnalyticsRepository)
    private analyticsRepository: IAnalyticsRepository,
    @inject(TYPES.LoggingService) private logger: ILoggingService
  ) {}

  getClicksByUrlId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { urlId } = req.params;

      if (!urlId) {
        res.status(400).json({ error: "URL ID is required" });
        return;
      }

      const clicks = await this.analyticsRepository.getClicksByUrlId(urlId);

      res.status(200).json({
        urlId,
        totalClicks: clicks.length,
        clicks,
      });
    } catch (error: any) {
      this.logger.error("Error getting clicks by URL ID", error);
      res.status(500).json({
        error:
          error.message || "An error occurred while retrieving analytics data",
      });
    }
  };

  getClicksByDateRange = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ error: "Start date and end date are required" });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ error: "Invalid date format" });
        return;
      }

      const clicks = await this.analyticsRepository.getClicksByDateRange(
        start,
        end
      );

      res.status(200).json({
        startDate: start,
        endDate: end,
        totalClicks: clicks.length,
        clicks,
      });
    } catch (error: any) {
      this.logger.error("Error getting clicks by date range", error);
      res.status(500).json({
        error:
          error.message || "An error occurred while retrieving analytics data",
      });
    }
  };

  getTopClicks = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const topClicks = await this.analyticsRepository.getTopClicks(limit);

      res.status(200).json({
        limit,
        topClicks,
      });
    } catch (error: any) {
      this.logger.error("Error getting top clicks", error);
      res.status(500).json({
        error:
          error.message || "An error occurred while retrieving top clicks data",
      });
    }
  };
}
