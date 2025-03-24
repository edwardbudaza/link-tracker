import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";

// Repositories
import { IUrlRepository } from "../interfaces/repositories/IUrlRepository";
import { UrlRepository } from "../repositories/UrlRepository";
import { IAnalyticsRepository } from "../interfaces/repositories/IAnalyticsRepository";
import { AnalyticsRepository } from "../repositories/AnalyticsRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { UserRepository } from "../repositories/UserRepository";

// Services
import { ILoggingService } from "../interfaces/services/ILoggingService";
import { LoggingService } from "../services/LoggingService";
import { IUrlShortenerService } from "../interfaces/services/IUrlShortenerService";
import { UrlShortenerService } from "../services/UrlShortenerService";
import { IHtmlProcessorService } from "../interfaces/services/IHtmlProcessorService";
import { HtmlProcessorService } from "../services/HtmlProcessorService";
import { IRedirectionService } from "../interfaces/services/IRedirectionService";
import { RedirectionService } from "../services/RedirectionService";
import { IAuthService } from "../interfaces/services/IAuthService";
import { AuthService } from "../services/authService";
import { TokenService } from '../services/tokenService';
import { UserService } from '../services/userService';

// Controllers
import { UrlController } from "../controllers/urlController";
import { RedirectController } from "../controllers/redirectController";
import { AnalyticsController } from "../controllers/analyticsController";
import { AuthController } from "../controllers/authController";

import { IAuthMiddleware } from "../interfaces/middlewares/IAuthMiddleware";
import { AuthMiddleware } from '../middlewares/authMiddleware';

const container = new Container();

// Bind repositories
container
  .bind<IUrlRepository>(TYPES.UrlRepository)
  .to(UrlRepository)
  .inSingletonScope();
container
  .bind<IAnalyticsRepository>(TYPES.AnalyticsRepository)
  .to(AnalyticsRepository)
  .inSingletonScope();
container
  .bind<IUserRepository>(TYPES.UserRepository)
  .to(UserRepository)
  .inSingletonScope();

// Bind services
container
  .bind<ILoggingService>(TYPES.LoggingService)
  .to(LoggingService)
  .inSingletonScope();
container
  .bind<IUrlShortenerService>(TYPES.UrlShortenerService)
  .to(UrlShortenerService)
  .inSingletonScope();
container
  .bind<IHtmlProcessorService>(TYPES.HtmlProcessorService)
  .to(HtmlProcessorService)
  .inSingletonScope();
container
  .bind<IRedirectionService>(TYPES.RedirectionService)
  .to(RedirectionService)
  .inSingletonScope();
container
  .bind<IAuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();
container
  .bind<TokenService>(TYPES.TokenService)
  .to(TokenService)
  .inSingletonScope();
container
  .bind<UserService>(TYPES.UserService)
  .to(UserService)
  .inSingletonScope();

// Bind controllers
container.bind<UrlController>(TYPES.UrlController).to(UrlController).inSingletonScope();
container.bind<RedirectController>(TYPES.RedirectController).to(RedirectController).inSingletonScope();
container.bind<AnalyticsController>(TYPES.AnalyticsController).to(AnalyticsController).inSingletonScope();
container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();

// Bind middlewares
container.bind<IAuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware).inSingletonScope();

export { container };
