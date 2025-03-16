export interface LogContext {
  [key: string]: any;
}

export interface ILoggingService {
  info(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}
