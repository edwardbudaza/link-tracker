export const TYPES = {
  // Repositories
  UrlRepository: Symbol.for("UrlRepository"),
  AnalyticsRepository: Symbol.for("AnalyticsRepository"),

  // Services
  LoggingService: Symbol.for("LoggingService"),
  UrlShortenerService: Symbol.for("UrlShortenerService"),
  HtmlProcessorService: Symbol.for("HtmlProcessorService"),
  RedirectionService: Symbol.for("RedirectionService"),

  // Controllers
  UrlController: Symbol.for("UrlController"),
  RedirectController: Symbol.for("RedirectController"),
  AnalyticsController: Symbol.for("AnalyticsController"),
};
