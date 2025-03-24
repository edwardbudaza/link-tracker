export const TYPES = {
  // Controllers
  AuthController: Symbol.for("AuthController"),
  UrlController: Symbol.for("UrlController"),
  AnalyticsController: Symbol.for("AnalyticsController"),
  RedirectController: Symbol.for("RedirectController"),

  // Services
  HtmlProcessorService: Symbol.for("HtmlProcessorService"),
  UrlShortenerService: Symbol.for("UrlShortenerService"),
  RedirectionService: Symbol.for("RedirectionService"),
  AuthService: Symbol.for("AuthService"),
  LoggingService: Symbol.for("LoggingService"),
  TokenService: Symbol.for("TokenService"),
  UserService: Symbol.for("UserService"),

  // Repositories
  UrlRepository: Symbol.for("UrlRepository"),
  AnalyticsRepository: Symbol.for("AnalyticsRepository"),
  UserRepository: Symbol.for("UserRepository"),

  // Middlewares
  AuthMiddleware: Symbol.for("AuthMiddleware"),
};
