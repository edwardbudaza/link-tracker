import { Request, Response } from "express";

export interface IAnalyticsController {
  getUrlAnalytics(req: Request, res: Response): Promise<void>;
} 