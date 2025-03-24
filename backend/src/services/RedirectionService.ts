import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { IRedirectionService } from "../interfaces/services/IRedirectionService";
import { IUrlShortenerService } from "../interfaces/services/IUrlShortenerService";
import { IAnalyticsRepository } from "../interfaces/repositories/IAnalyticsRepository";
import { ILoggingService } from "../interfaces/services/ILoggingService";
import { parseUserAgent, getClientIp } from "../utils/userAgentParser";
import { TYPES } from "../di/types";

@injectable()
export class RedirectionService implements IRedirectionService {
  constructor(
    @inject(TYPES.UrlShortenerService)
    private urlShortenerService: IUrlShortenerService,
    @inject(TYPES.AnalyticsRepository)
    private analyticsRepository: IAnalyticsRepository,
    @inject(TYPES.LoggingService) private logger: ILoggingService
  ) {}

  async redirect(req: Request, res: Response, next: NextFunction): Promise<void> {
    const shortId = req.params.shortId;

    try {
      const originalUrl = await this.urlShortenerService.getOriginalUrl(shortId);

      if (!originalUrl) {
        res.status(404).json({
          success: false,
          message: "URL not found"
        });
        return;
      }

      // Track click analytics
      try {
        const userAgentInfo = parseUserAgent(req);
        const ipAddress = getClientIp(req);
        const referrer = req.headers.referer || "";

        // Track the click asynchronously - don't wait for it to complete
        this.analyticsRepository.createClickEvent({
          urlId: shortId,
          timestamp: new Date(),
          ipAddress,
          userAgent: req.headers["user-agent"],
          referrer,
          browser: userAgentInfo.browser,
          deviceType: userAgentInfo.device,
          os: userAgentInfo.os,
        }).catch(err => {
          this.logger.error("Failed to track click event", err);
        });
      } catch (analyticsError) {
        // Log the error but don't prevent redirection
        this.logger.error("Error tracking click", analyticsError as Error);
      }

      // Redirect to the original URL
      res.redirect(originalUrl);
    } catch (error) {
      this.logger.error("Redirection error", error as Error);
      next(error);
    }
  }

  async recordClickEvent(shortId: string, req: Request): Promise<void> {
    try {
      const userAgentInfo = parseUserAgent(req);
      const ipAddress = getClientIp(req);
      const referrer = req.headers.referer || "";

      await this.analyticsRepository.createClickEvent({
        urlId: shortId,
        timestamp: new Date(),
        ipAddress,
        userAgent: req.headers["user-agent"],
        referrer,
        browser: userAgentInfo.browser,
        deviceType: userAgentInfo.device,
        os: userAgentInfo.os,
      });
    } catch (error) {
      this.logger.error("Failed to record click event", error as Error);
      throw error;
    }
  }
}
