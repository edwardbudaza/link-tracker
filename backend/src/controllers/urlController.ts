import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { IUrlShortenerService } from "../interfaces/services/IUrlShortenerService";
import { IHtmlProcessorService } from "../interfaces/services/IHtmlProcessorService";
import { ILoggingService } from "../interfaces/services/ILoggingService";
import { TYPES } from "../di/types";
import { IUrlRepository } from "../interfaces/repositories/IUrlRepository";

@injectable()
export class UrlController {
  constructor(
    @inject(TYPES.UrlShortenerService)
    private urlShortenerService: IUrlShortenerService,
    @inject(TYPES.HtmlProcessorService)
    private htmlProcessorService: IHtmlProcessorService,
    @inject(TYPES.LoggingService) private logger: ILoggingService,
    @inject(TYPES.UrlRepository) private urlRepository: IUrlRepository
  ) {}

  shortenUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url, customSlug } = req.body;

      if (!url) {
        res.status(400).json({ error: "URL is required" });
        return;
      }

      const shortenedUrl = await this.urlShortenerService.shortenUrl(
        url,
        customSlug
      );

      res.status(201).json({
        originalUrl: shortenedUrl.originalUrl,
        shortUrl: `${req.protocol}://${req.get("host")}/${
          shortenedUrl.shortId
        }`,
        shortId: shortenedUrl.shortId,
        customSlug: shortenedUrl.customSlug,
        createdAt: shortenedUrl.createdAt,
      });
    } catch (error: any) {
      this.logger.error("Error shortening URL", error);
      res
        .status(error.message === "Custom slug already in use" ? 409 : 500)
        .json({
          error: error.message || "An error occurred while shortening the URL",
        });
    }
  };

  processHtml = async (req: Request, res: Response): Promise<void> => {
    try {
      const { html, baseUrl } = req.body;

      if (!html) {
        res.status(400).json({ error: "HTML content is required" });
        return;
      }

      const processedHtml = await this.htmlProcessorService.processHtml(
        html,
        baseUrl || `${req.protocol}://${req.get("host")}`
      );

      res.status(200).json({
        processedHtml,
        originalLinks: this.htmlProcessorService.extractUrls(html).length,
        processedLinks:
          this.htmlProcessorService.extractUrls(processedHtml).length,
      });
    } catch (error: any) {
      this.logger.error("Error processing HTML", error);
      res.status(500).json({
        error: error.message || "An error occurred while processing the HTML",
      });
    }
  };

  async getUserUrls(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Default pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Get URLs created by this user
      const urls = await this.urlRepository.findByUserId(userId, { skip, limit });
      const total = await this.urlRepository.countByUserId(userId);

      res.status(200).json({
        success: true,
        urls,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      this.logger.error("Error fetching user URLs", error as Error);
      next(error);
    }
  }
}
