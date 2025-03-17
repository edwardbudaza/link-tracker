import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { IUrlShortenerService } from "../interfaces/services/IUrlShortenerService";
import { IHtmlProcessorService } from "../interfaces/services/IHtmlProcessorService";
import { ILoggingService } from "../interfaces/services/ILoggingService";
import { TYPES } from "../di/types";

@injectable()
export class UrlController {
  constructor(
    @inject(TYPES.UrlShortenerService)
    private urlShortnerService: IUrlShortenerService,
    @inject(TYPES.HtmlProcessorService)
    private htmlProcessorService: IHtmlProcessorService,
    @inject(TYPES.LoggingService) private logger: ILoggingService
  ) {}

  shortenUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url, customSlug } = req.body;

      if (!url) {
        res.status(400).json({ error: "URL is required" });
        return;
      }

      const shortenedUrl = await this.urlShortnerService.shortenUrl(
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
        .status(error.message === "Custom slug already in user" ? 409 : 500)
        .json({
          error: error.message || "An error occured while shortening the URL",
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

      res
        .status(200)
        .json({
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
}
