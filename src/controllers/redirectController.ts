import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { IRedirectionService } from "../interfaces/services/IRedirectionService";
import { ILoggingService } from "../interfaces/services/ILoggingService";
import { TYPES } from "../di/types";

@injectable()
export class RedirectController {
  constructor(
    @inject(TYPES.RedirectionService)
    private redireciontService: IRedirectionService,
    @inject(TYPES.LoggingService) private logger: ILoggingService
  ) {}

  redirect = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.redireciontService.redirect(req, res);
    } catch (error: any) {
      this.logger.error("Redirection controller error", error);
      res.status(500).json({
        error: error.message || "An error occured during redirection",
      });
    }
  };
}
