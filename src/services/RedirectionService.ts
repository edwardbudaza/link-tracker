import { injectable, inject } from "inversify";
import { Request, Response } from "express";
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

  async redirect(req: Request, res: Response): Promise<void> {
    const shortId = req.params.shortId;

    try {
      const originalUrl = await this.urlShortenerService.getOriginalUrl(
        shortId
      );

      if (!originalUrl) {
        this.logger.warn("Redirection failed: URL not found", { shortId });
        res.status(404).send("URL not found");
        return;
      }

      // Record the click event in the background
      this.recordClickEvent(shortId, req).catch((error) => {
        this.logger.error("Error recording click event", error);
      });

      // Redirect to the original URL
      res.redirect(originalUrl);
    } catch (error) {
      this.logger.error("Redirection error", error as Error, { shortId });
      res.status(500).send("An error occurred during redirection");
    }
  }

  async recordClickEvent(shortId: string, req: Request): Promise<void> {
    try {
      const userAgentInfo = parseUserAgent(req);
      const ipAddress = getClientIp(req);
      const referer = req.headers.referer || "";

      await this.analyticsRepository.createClickEvent({
        urlId: shortId,
        timestamp: new Date(),
        ipAddress,
        userAgent: req.headers["user-agent"],
        referer,
        browser: userAgentInfo.browser,
        device: userAgentInfo.device,
        os: userAgentInfo.os,
      });

      this.logger.debug("Click event recorded", { shortId, ipAddress });
    } catch (error) {
      this.logger.error("Error recording click event", error as Error, {
        shortId,
      });
      throw error;
    }
  }
}
