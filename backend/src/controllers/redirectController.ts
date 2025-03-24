import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { IRedirectionService } from "../interfaces/services/IRedirectionService";
import { ILoggingService } from "../interfaces/services/ILoggingService";
import { TYPES } from "../di/types";

@injectable()
export class RedirectController {
  constructor(
    @inject(TYPES.RedirectionService)
    private redirectionService: IRedirectionService,
    @inject(TYPES.LoggingService) private logger: ILoggingService
  ) {}

  redirect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.redirectionService.redirect(req, res, next);
    } catch (error: any) {
      this.logger.error("Redirection controller error", error);
      res.status(500).json({
        error: error.message || "An error occurred during redirection",
      });
    }
  };
}
