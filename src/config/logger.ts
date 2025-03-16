import { createLogger, format, transports } from "winston";
import { datadogLogs } from "@datadog/browser-logs";

// Initialize Datadog logs when in production
if (process.env.NODE_ENV === "production") {
  datadogLogs.init({
    clientToken: process.env.DATADOG_CLIENT_TOKEN || "",
    site: "us5.datadoghq.com",
    forwardErrorsToLogs: true,
    sessionSampleRate: 100,
  });
}

export const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "link-tracker" },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          }`;
        })
      ),
    }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

// Custom transport for Datadog in production
if (process.env.NODE_ENV === "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.json()),
      log: (info, callback) => {
        datadogLogs.logger.log(info.message, { level: info.level, ...info });
        callback();
      },
    })
  );
}
