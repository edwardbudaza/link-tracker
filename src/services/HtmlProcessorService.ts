import { injectable, inject } from "inversify";
import { JSDOM } from "jsdom";
import { IHtmlProcessorService } from "../interfaces/services/IHtmlProcessorService";
import { IUrlShortenerService } from "../interfaces/services/IUrlShortenerService";
import { ILoggingService } from "../interfaces/services/ILoggingService";
import { isValidUrl } from "../utils/urlGenerator";
import { APP_CONFIG } from "../config/app";
import { TYPES } from "../di/types";

@injectable()
export class HtmlProcessorService implements IHtmlProcessorService {
  constructor(
    @inject(TYPES.UrlShortenerService)
    private urlShortenerService: IUrlShortenerService,
    @inject(TYPES.LoggingService) private logger: ILoggingService
  ) {}

  extractUrls(html: string): string[] {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      const anchorTags = document.querySelectorAll("a");

      // Extract and filter valid URLs
      const urls: string[] = [];
      anchorTags.forEach((anchor) => {
        const href = anchor.getAttribute("href");
        if (href && isValidUrl(href)) {
          urls.push(href);
        }
      });

      return [...new Set(urls)]; // Remove duplicates
    } catch (error) {
      this.logger.error("Error extracting URLs from HTML", error as Error);
      return [];
    }
  }

  async processHtml(html: string, baseUrl?: string): Promise<string> {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      const anchorTags = document.querySelectorAll("a");

      // Process each anchor tag
      const processPromises = Array.from(anchorTags).map(async (anchor) => {
        const href = anchor.getAttribute("href");

        // Skip if href is empty or not a valid URL
        if (!href || !isValidUrl(href)) {
          return;
        }

        try {
          // Shorten the URL
          const shortenedUrl = await this.urlShortenerService.shortenUrl(href);

          // Replace the href with the shortened URL
          const trackableUrl = `${baseUrl}/${shortenedUrl.shortId}`;
          anchor.setAttribute("href", trackableUrl);

          // Add data attribute for tracking
          anchor.setAttribute("data-original-url", href);
        } catch (error) {
          this.logger.error(
            "Error shortening URL during HTML processing",
            error as Error,
            { href }
          );
        }
      });

      // Wait for all anchor tags to be processed
      await Promise.all(processPromises);

      return dom.serialize();
    } catch (error) {
      this.logger.error("Error processing HTML ", error as Error);
      throw error;
    }
  }
}
