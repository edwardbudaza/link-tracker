import { UAParser } from "ua-parser-js";
import { Request } from "express";

export interface UserAgentInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const parseUserAgent = (req: Request): UserAgentInfo => {
  const userAgentString = req.headers["user-agent"] || "";
  const parser = new UAParser(); // Create an instance
  parser.setUA(userAgentString); // Set the user agent
  const result = parser.getResult(); // Get parsed data

  const device =
    result.device.type ||
    (result.device.vendor
      ? `${result.device.vendor} ${result.device.model}`
      : "unknown");
  const isMobile = result.device.type === "mobile";
  const isTablet = result.device.type === "tablet";
  const isDesktop = !isMobile && !isTablet;

  return {
    browser: result.browser.name || "unknown",
    browserVersion: result.browser.version || "unknown",
    os: result.os.name || "unknown",
    osVersion: result.os.version || "unknown",
    device,
    isMobile,
    isTablet,
    isDesktop,
  };
};

// Get client IP address from request
export const getClientIp = (req: Request): string => {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    ""
  );
};
