import { injectable } from "inversify";
import {
  ILoggingService,
  LogContext,
} from "../interfaces/services/ILoggingService";
import { logger } from "../config/logger";

@injectable()
export class LoggingService implements ILoggingService {
  info(message: string, context?: LogContext): void {
    logger.info(message, { ...context });
  }

  error(message: string, error?: Error, context?: LogContext): void {
    logger.error(message, { error: error?.stack, ...context });
  }

  warn(message: string, context?: LogContext): void {
    logger.warn(message, { ...context });
  }

  debug(message: string, context?: LogContext): void {
    logger.debug(message, { ...context });
  }
}
