import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../di/types";
import { IUrlService } from "../interfaces/services/IUrlService";
import { logger } from "../config/logger";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { JSDOM } from "jsdom";

@injectable()
export class HtmlProcessorController {
  constructor(
    @inject(TYPES.UrlService) private urlService: IUrlService
  ) {}

  /**
   * Process HTML content by replacing all URLs with shortened, tracked links
   */
  processHtml = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { htmlContent, baseUrl } = req.body;

      if (!htmlContent || !baseUrl) {
        res.status(400).json({
          success: false,
          message: "HTML content and base URL are required",
        });
        return;
      }

      // Validate base URL
      try {
        new URL(baseUrl);
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Invalid base URL",
        });
        return;
      }

      // Parse HTML using JSDOM
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;

      // Find all links
      const links = document.querySelectorAll("a");
      const processedLinks: { original: string; shortened: string }[] = [];

      // Process each link
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const href = link.getAttribute("href");

        if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
          try {
            // Normalize URL (handle relative URLs)
            const absoluteUrl = new URL(href, baseUrl).href;
            
            // Create shortened URL
            const shortUrl = await this.createShortenedUrl(absoluteUrl, req.user?.id);
            
            // Update link in DOM
            link.setAttribute("href", shortUrl);
            
            // Track processed link
            processedLinks.push({
              original: absoluteUrl,
              shortened: shortUrl,
            });
          } catch (error) {
            logger.warn(`Error processing link: ${href}`, { error });
            // Continue with next link if one fails
          }
        }
      }

      // Get processed HTML
      const processedHtml = dom.serialize();

      res.status(200).json({
        success: true,
        message: "HTML processed successfully",
        processedHtml,
        stats: {
          totalLinks: links.length,
          processedLinks: processedLinks.length,
          links: processedLinks,
        },
      });
    } catch (error) {
      logger.error("Error processing HTML:", { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({
        success: false,
        message: "Failed to process HTML content",
      });
    }
  };

  /**
   * Helper method to create shortened URL
   */
  private async createShortenedUrl(originalUrl: string, userId?: string): Promise<string> {
    try {
      // Check if URL already exists
      const existingUrl = await this.urlService.findByOriginalUrl(originalUrl);
      
      if (existingUrl) {
        return existingUrl.shortUrl;
      }
      
      // Create new shortened URL
      const result = await this.urlService.create({
        originalUrl,
        creator: userId, // Will be undefined for anonymous requests
      });
      
      return result.shortUrl;
    } catch (error) {
      logger.error("Error creating shortened URL:", { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
} 