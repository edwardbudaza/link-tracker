import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";

// Repositories
import { IUrlRepository } from "../interfaces/repositories/IUrlRepository";
import { UrlRepository } from "../repositories/UrlRepository";
import { IAnalyticsRepository } from "../interfaces/repositories/IAnalyticsRepository";
import { AnalyticsRepository } from "../repositories/AnalyticsRepository";

// Services
import { ILoggingService } from "../interfaces/services/ILoggingService";
import { LoggingService } from "../services/LoggingService";
import { IUrlShortenerService } from "../interfaces/services/IUrlShortenerService";
import { UrlShortenerService } from "../services/UrlShortenerService";
import { IHtmlProcessorService } from "../interfaces/services/IHtmlProcessorService";
import { HtmlProcessorService } from "../services/HtmlProcessorService";
import { IRedirectionService } from "../interfaces/services/IRedirectionService";
import { RedirectionService } from "../services/RedirectionService";

// Controllers
import { UrlController } from "../controllers/urlController";
import { RedirectController } from "../controllers/redirectController";
import { AnalyticsController } from "../controllers/analyticsController";

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

// Bind controllers
container.bind<UrlController>(UrlController).toSelf();
container.bind<RedirectController>(RedirectController).toSelf();
container.bind<AnalyticsController>(AnalyticsController).toSelf();

export { container };
