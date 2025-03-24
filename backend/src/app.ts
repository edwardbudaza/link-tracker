import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { APP_CONFIG } from "./config/app";
import { connectDB } from "./config/database";
import { logger } from "./config/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import { container } from "./di/container";
import { TYPES } from "./di/types";
import { IAuthController } from "./interfaces/controllers/IAuthController";
import { IUrlController } from "./interfaces/controllers/IUrlController";
import { IAnalyticsController } from "./interfaces/controllers/IAnalyticsController";
import { IRedirectController } from "./interfaces/controllers/IRedirectController";
import { authMiddleware } from "./middlewares/authMiddleware";

// Import swagger document
const swaggerDocument = require("../swagger.json");

// Import routes
import urlRoutes from "./routes/urlRoutes";
import redirectRoutes from "./routes/redirectRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import authRoutes from "./routes/authRoutes";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security
    this.app.use(helmet({
      contentSecurityPolicy: false // Allow Swagger UI to load scripts and styles
    }));

    // CORS
    this.app.use(cors());

    // Compression
    this.app.use(compression());

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use(requestLogger);

    // Swagger documentation
    this.app.get("/swagger.json", (req, res) => {
      res.json(swaggerDocument);
    });
    
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        filter: true,
        displayRequestDuration: true,
        docExpansion: 'none' // Start with all sections collapsed
      }
    }));
  }

  private initializeRoutes(): void {
    // Auth routes
    this.app.use(`${APP_CONFIG.apiPrefix}/auth`, authRoutes);
    
    // API routes
    this.app.use(`${APP_CONFIG.apiPrefix}/urls`, urlRoutes);
    this.app.use(`${APP_CONFIG.apiPrefix}/analytics`, analyticsRoutes);

    // Redirection route (needs to be last to avoid conflicts)
    this.app.use("/", redirectRoutes);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to MongoDB
      await connectDB();

      // Start the server
      const port = APP_CONFIG.port;
      this.app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
        logger.info(
          `API Documentation available at ${APP_CONFIG.baseUrl}/api-docs`
        );
      });
    } catch (error) {
      logger.error("Failed to start the server", error);
      process.exit(1);
    }
  }
}

export default App;
